"""Exercise the real translation UI and routes with synthetic microphone/API data."""
import json
import subprocess
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'tmp' / 'sentence-translation-browser'
OUT.mkdir(parents=True, exist_ok=True)
BANK = json.loads(subprocess.check_output(['node', '-e', 'process.stdout.write(JSON.stringify(require("./lib/sentence-translation-bank").QUESTIONS))'], cwd=ROOT).decode())
BY_ID = {q['id']: q for q in BANK}
BASE = 'http://127.0.0.1:10002'
SERVER = r'''
const express=require('express'),path=require('path');
const {mountSentenceGame}=require('./lib/sentence-game');
const {PetStore,createState}=require('./lib/pet-store');
const app=express();app.use(express.json());app.use(express.static('public'));
app.get('/api/pet/state',(req,res)=>res.json({...createState(Date.now()),serverNow:Date.now()}));
const fetcher=async(url,init)=>{
  if(url.endsWith('/transcriptions'))return Response.json({text:'I have a friend who can speak English.'});
  if(url.endsWith('/responses')){const data=JSON.parse(JSON.parse(init.body).input);return Response.json({output_text:JSON.stringify({verdict:data.transcript.includes('wrong')?'incorrect':'correct',feedback:'日本語の意味と、選んだパターンを確認しました。',corrected:data.reference})});}
  throw Error('Unexpected upstream request');
};
mountSentenceGame(app,{env:{OPENAI_API_KEY:'browser-test',SENTENCE_GAME_STORAGE:'local',SENTENCE_GAME_DATA_DIR:path.join(process.argv[1],'answers')},fetcher,petStore:new PetStore({dir:path.join(process.argv[1],'pets'),practicePolicy:'daily'})});
app.listen(10002,'127.0.0.1',()=>console.log('ready'));
'''

with tempfile.TemporaryDirectory(prefix='translation-browser-', dir=OUT) as data_dir:
    server = subprocess.Popen(['node', '-e', SERVER, data_dir], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    try:
        assert server.stdout.readline().strip() == 'ready'
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'])
            ctx = browser.new_context(viewport={'width':390,'height':844}, permissions=['microphone'], reduced_motion='reduce')
            ctx.add_cookies([{'name':'phraseDeviceId','value':'translation-browser-device','url':BASE}])
            ctx.add_init_script('''
              window.__gumCalls=0;window.__streams=[];
              // Model iOS retaining the music page's playback-only session.
              const audioSession={type:'playback'};
              Object.defineProperty(navigator,'audioSession',{configurable:true,get:()=>audioSession});
              const gum=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
              navigator.mediaDevices.getUserMedia=async c=>{
                window.__gumCalls++;
                if(audioSession.type!=='play-and-record')throw new DOMException('AudioSession category is not compatible with audio capture','NotReadableError');
                const s=await gum(c);window.__streams.push(s);return s;
              };
              window.__requestMic=navigator.mediaDevices.getUserMedia;
            ''')
            page = ctx.new_page()
            errors=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            page.goto(BASE+'/sentence-game.html')
            page.locator('#begin:not([disabled])').wait_for()
            assert page.locator('.pattern-choice').count()==27
            assert '253' in page.locator('#question-count').inner_text()
            for width in [320,390,768]:
                page.set_viewport_size({'width':width,'height':844})
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
            page.set_viewport_size({'width':390,'height':844})
            page.screenshot(path=str(OUT/'01-patterns.png'),full_page=True)
            page.get_by_role('button',name='who',exact=True).click()
            assert page.locator('[data-pattern="who"]').get_attribute('aria-pressed')=='true'
            with page.expect_response(lambda response:response.url.endswith('/attempts')) as response:
                page.locator('#begin').click()
            first=response.value.json()
            page.locator('#answer-input:not([disabled])').wait_for()
            assert page.evaluate('__gumCalls')==0,'Typed input must never request a microphone'
            assert page.locator('#japanese-prompt').inner_text()==first['question']['japanese']
            assert not page.locator('#judge').is_enabled()
            assert BY_ID[first['question']['id']]['answer'] not in page.locator('#question-screen').inner_text()
            page.screenshot(path=str(OUT/'02-answer.png'),full_page=True)
            page.locator('#answer-input').fill(BY_ID[first['question']['id']]['answer'])
            page.locator('#judge').click()
            page.locator('#result').wait_for(state='visible')
            assert page.locator('#result-title').inner_text()=='正解！'
            assert page.locator('#practice-count').inner_text()=='1 / 10回'
            page.screenshot(path=str(OUT/'03-correct.png'),full_page=True)
            page.locator('#solution-audio').click()
            page.wait_for_function('document.querySelector("#game-audio").currentTime>0')
            page.locator('#repeat').click()
            page.locator('#answer-input:not([disabled])').wait_for()
            page.locator('#voice-input').click()
            page.wait_for_function('document.querySelector("#voice-input").getAttribute("aria-pressed")==="true"',timeout=5000)
            assert page.evaluate('navigator.audioSession.type')=='play-and-record'
            page.wait_for_timeout(350)
            page.locator('#voice-input').click()
            page.wait_for_function('document.querySelector("#answer-input").value.includes("I have a friend")')
            assert page.evaluate('__streams.every(s=>s.getTracks().every(t=>t.readyState==="ended"))')
            assert page.evaluate('navigator.audioSession.type')=='playback'
            page.locator('#answer-input').fill('This is wrong.')
            page.locator('#judge').click()
            page.locator('#result').wait_for(state='visible')
            assert page.locator('#result-title').inner_text()=='お手本で確認しよう'
            assert page.locator('#saved-review').is_visible()
            page.locator('#saved-review').click()
            page.locator('#review-translation-prompt').wait_for(state='visible')
            assert page.locator('#review-prompt').inner_text()==first['question']['japanese']
            assert page.locator('#review-text-0').is_hidden()
            assert page.locator('#review-question-audio').is_hidden()
            assert page.locator('#review-answer').is_hidden()
            page.locator('#review-reveal').click()
            page.locator('#review-answer').wait_for(state='visible')
            assert page.locator('#review-reference').inner_text()==BY_ID[first['question']['id']]['answer']
            page.screenshot(path=str(OUT/'04-review.png'),full_page=True)
            page.locator('#practice-tab').click()
            page.locator('#begin').click()
            page.locator('#answer-input:not([disabled])').wait_for()
            page.evaluate('()=>{navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException("denied","NotAllowedError")}}')
            page.locator('#voice-input').click()
            page.locator('#error').wait_for(state='visible')
            assert page.evaluate('navigator.audioSession.type')=='playback','Denied microphone must release the capture session'
            assert page.locator('#answer-input').is_enabled()
            page.locator('#answer-input').fill('I know someone who can help.')
            assert page.locator('#judge').is_enabled()
            page.locator('#exit').click()
            page.get_by_role('button',name='by the time',exact=True).click()
            page.locator('#begin').click()
            page.locator('#answer-input:not([disabled])').wait_for()
            assert page.locator('#round-pattern').inner_text()=='by the time'
            assert page.locator('#round-position').inner_text()=='1 / 10問'
            for width in [320,390,768]:
                page.set_viewport_size({'width':width,'height':844})
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
            # A late permission result must not release a newer recording's session.
            page.evaluate('()=>{navigator.mediaDevices.getUserMedia=c=>new Promise(resolve=>{window.__grantMic=async()=>resolve(await window.__requestMic(c));});}')
            page.locator('#voice-input').click()
            page.wait_for_function('typeof window.__grantMic==="function"')
            assert page.evaluate('navigator.audioSession.type')=='play-and-record'
            page.locator('#exit').click()
            assert page.evaluate('navigator.audioSession.type')=='playback'
            page.evaluate('()=>{navigator.mediaDevices.getUserMedia=window.__requestMic;}')
            page.locator('#begin').click()
            page.locator('#answer-input:not([disabled])').wait_for()
            page.locator('#voice-input').click()
            page.wait_for_function('document.querySelector("#voice-input").getAttribute("aria-pressed")==="true"')
            page.evaluate('()=>window.__grantMic()')
            page.wait_for_function('__streams.at(-1).getTracks().every(t=>t.readyState==="ended")')
            assert page.evaluate('navigator.audioSession.type')=='play-and-record'
            assert page.evaluate('__streams.at(-2).getTracks().some(t=>t.readyState==="live")')
            page.locator('#exit').click()
            assert page.evaluate('navigator.audioSession.type')=='playback'
            assert page.evaluate('__streams.every(s=>s.getTracks().every(t=>t.readyState==="ended"))')
            assert errors==[],errors
            browser.close()
        print(json.dumps({'result':'PASS','screenshots':str(OUT),'viewports':[320,390,768],'errors':errors},ensure_ascii=False))
    finally:
        server.terminate()
        server.wait(timeout=10)
