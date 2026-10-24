"""Real HTML audio + fake browser microphone; upstream APIs are mocked.
No user recordings, production writes or credentials are used.
"""
import io, json, subprocess, wave
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BASE = 'http://127.0.0.1:10001'
OUT = ROOT / 'tmp' / 'sentence-game-browser'
OUT.mkdir(parents=True, exist_ok=True)
TYPES=json.loads(subprocess.check_output(['node','-e','process.stdout.write(JSON.stringify(require("./lib/sentence-game-bank").TYPES))'],cwd=ROOT).decode('utf-8'))
STATE=json.loads(subprocess.check_output(['node','-e','const {createState,newPet}=require("./lib/pet-store");const s=createState(Date.now()),p=newPet(Date.now());const day=require("./public/pet-rules").dayKey(Date.now());p.practice={from:day,policy:"daily",counts:{[day]:9}};s.pets.push(p);s.revision=1;s.serverNow=Date.now();process.stdout.write(JSON.stringify(s));'],cwd=ROOT).decode('utf-8'))
def daily():
    count=list(STATE['pets'][0]['practice']['counts'].values())[0]
    return dict(count=count,required=10,remaining=max(0,10-count),met=count>=10,optional=False,petId=STATE['pets'][0]['id'],alive=True)
def audio(seconds):
    out = io.BytesIO()
    with wave.open(out, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(b'\0\0' * int(24000 * seconds))
    return out.getvalue()

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'])
    ctx = browser.new_context(viewport={'width':390,'height':844}, permissions=['microphone'], reduced_motion='reduce')
    ctx.add_init_script('''
      window.__loud=false;window.__recordStarts=0;window.__gumCalls=0;window.__streams=[];
      const acquire=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getUserMedia=async constraints=>{window.__gumCalls++;const stream=await acquire(constraints);window.__streams.push(stream);return stream;};
      const make=AudioContext.prototype.createAnalyser;
      AudioContext.prototype.createAnalyser=function(){const a=make.call(this);a.getFloatTimeDomainData=data=>data.fill(window.__loud?.07:0);return a;};
      const start=MediaRecorder.prototype.start;
      MediaRecorder.prototype.start=function(...args){window.__recordStarts++;return start.apply(this,args);};
    ''')
    ctx.route('**/api/pet/**',lambda r:r.fulfill(json=STATE))
    requests=[];counter=0
    def api(route):
        global counter
        path=route.request.url.split('/api/sentence-game/')[-1]
        requests.append(path)
        if path=='config':
            return route.fulfill(json=dict(openai=True,elevenlabs=True,types=TYPES,questions=34,onsetTimeoutMs=5000,silenceMs=1600,maxRecordingMs=45000,dailyPractice=daily()))
        if path=='practice':
            return route.fulfill(json=dict(dailyPractice=daily()))
        if path=='attempts':
            counter+=1
            body=route.request.post_data_json
            qid=body.get('repeat') or ('who-1' if counter==1 else 'who-2')
            return route.fulfill(status=201,json=dict(id='attempt-'+str(counter),question=dict(id=qid,sentences=['I met a man.','He lives in Tokyo.']),audio=dict(url='/api/sentence-game/audio/question',duration=6,cues=[dict(index=0,start=0,end=3),dict(index=1,start=3,end=6)])))
        if path.startswith('audio/'):
            return route.fulfill(body=audio(.5 if path.endswith('solution') else 6),content_type='audio/wav')
        if path.endswith('/solution-audio'):
            return route.fulfill(json=dict(url='/api/sentence-game/audio/solution',duration=.5,cues=[]))
        if path.endswith('/no-answer') or path.endswith('/answer'):
            no=path.endswith('/no-answer')
            if not no: assert len(route.request.post_data_buffer)>100
            if not no:
                key=next(iter(STATE['pets'][0]['practice']['counts']))
                STATE['pets'][0]['practice']['counts'][key]+=1
                STATE['revision']+=1
            return route.fulfill(json=dict(verdict='no_answer' if no else 'correct',feedback='もう一度挑戦しよう。' if no else '自然につなげられました。',transcript='' if no else 'I met a man that lives in Tokyo.',reference='I met a man who lives in Tokyo.',corrected='I met a man who lives in Tokyo.',type='who',score=0 if no else 100,explanation='who 以下でどんな人かを説明します。that でも正解です。',dailyPractice=daily()))
        raise AssertionError(path)
    ctx.route('**/api/sentence-game/**',api)
    page=ctx.new_page();errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE+'/voice-practice.html',wait_until='domcontentloaded')
    assert page.url.endswith('/sentence-game.html')
    page.locator('#begin:not([disabled])').wait_for()
    assert page.locator('#filter option').count()==20
    assert page.locator('#practice-count').inner_text()=='9 / 10回'
    for width in [320,390,768]:
        page.set_viewport_size({'width':width,'height':844})
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    page.set_viewport_size({'width':390,'height':844})
    page.screenshot(path=str(OUT/'setup.png'),full_page=True)
    page.locator('#begin').click()
    page.wait_for_function('document.querySelector("#game-audio").currentTime>5.05')
    assert page.evaluate('__recordStarts')==0, 'No recording and no five-second timeout while the two sentences are playing'
    assert not any(x.endswith('/no-answer') for x in requests)
    page.wait_for_function('__recordStarts===1')
    assert page.locator('#voice-state').get_attribute('data-phase')=='recording'
    page.screenshot(path=str(OUT/'recording.png'),full_page=True)
    page.locator('#result').wait_for(state='visible',timeout=8000)
    assert page.locator('#result-title').inner_text()=='回答なし'
    assert len([x for x in requests if x.endswith('/no-answer')])==1
    assert not any(x.endswith('/answer') for x in requests)
    assert page.locator('#practice-count').inner_text()=='9 / 10回', 'No answer must not increase daily practice'
    assert page.evaluate('__gumCalls')==1
    assert page.evaluate('__streams[0].getAudioTracks().every(t=>t.readyState==="live"&&!t.enabled)'), 'Grade/results mute the existing microphone instead of closing it'
    page.locator('#repeat').click()
    page.wait_for_function('__recordStarts===2')
    page.evaluate('__loud=true')
    page.wait_for_timeout(5500)
    assert page.locator('#voice-state').get_attribute('data-phase')=='recording', 'Speech begun in time must continue beyond five seconds'
    assert page.locator('#countdown').is_hidden()
    assert page.evaluate('__gumCalls')==1, 'Repeating a question must reuse the microphone permission and stream'
    page.evaluate('__loud=false')
    page.locator('#result').wait_for(state='visible',timeout=6000)
    assert page.locator('#result-title').inner_text()=='正解！'
    assert len([x for x in requests if x.endswith('/answer')])==1
    assert page.locator('#practice-count').inner_text()=='10 / 10回'
    assert page.locator('#practice-label').inner_text()=='今日の10回、達成！'
    assert page.evaluate('__streams[0].getAudioTracks().every(t=>t.readyState==="live"&&!t.enabled)')
    for width in [320,390,768]:
        page.set_viewport_size({'width':width,'height':844})
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    page.set_viewport_size({'width':390,'height':844})
    page.screenshot(path=str(OUT/'result.png'),full_page=True)
    page.locator('#goal-pet').click()
    try:
        page.locator('.pet-practice-goal').wait_for(state='visible',timeout=5000)
    except Exception:
        print(json.dumps(dict(errors=errors,pet=page.evaluate('PetGame.getState()'),body=page.locator('body').inner_text()[-1800:]),ensure_ascii=False))
        page.screenshot(path=str(OUT/'pet-error.png'),full_page=True)
        raise
    assert '達成' in page.locator('.pet-practice-goal').inner_text()
    page.screenshot(path=str(OUT/'pet-daily-goal.png'),full_page=True)
    page.locator('.pet-overlay [data-action="close"]').first.click()
    page.locator('#solution-audio').click()
    page.wait_for_function('document.querySelector("#game-audio").ended')
    assert page.evaluate('__recordStarts')==2, 'Solution playback must never restart recording'
    assert page.evaluate('__gumCalls')==1
    page.locator('#next').click()
    page.wait_for_function('document.querySelector("#game-audio").currentTime>.1')
    assert page.evaluate('__gumCalls')==1, 'The next question must also reuse the original microphone'
    page.locator('#exit').click()
    assert page.locator('#setup').is_visible()
    page.wait_for_timeout(300)
    assert page.evaluate('__recordStarts')==2, 'Exiting cancels late async work'
    assert page.evaluate('__streams.every(s=>s.getTracks().every(t=>t.readyState==="ended"))'), 'Leaving the practice must release all microphone tracks'
    assert errors==[], errors
    # A denied microphone is recoverable, does not create an attempt or a wrong answer.
    before=len([x for x in requests if x=='attempts'])
    page.evaluate('()=>{navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException("denied","NotAllowedError")}}')
    page.locator('#begin').click()
    page.locator('#error').wait_for(state='visible')
    assert page.locator('#setup').is_visible()
    assert len([x for x in requests if x=='attempts'])==before
    print(json.dumps(dict(result='PASS',recordings=2,noAnswers=1,spokenAnswers=1,viewports=[320,390,768],errors=errors,images=str(OUT)),ensure_ascii=False))
    browser.close()
