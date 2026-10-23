"""Exercise the real Lyric Shadows home, recorder and scenario screens with fake upstream calls.
Chromium supplies a fake microphone; no user's microphone, API key, or saved pet data is used.
"""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'tmp'
BASE = 'http://127.0.0.1:10001'
REQUEST = '友人の恋人と初めて会って話す'
SCENARIO = dict(request=REQUEST, title='友人の恋人と初めて会う', relationship='友人の恋人と初対面', place='カフェ', time='休日の午後', partnerName='Alex', context='共通の友人から紹介される。', assumed=['place', 'time', 'partnerName'])
FAKE_PEER = r"""(() => {
 let channel, counter=0;
 const emit=(type, data={})=>channel?.onmessage?.({data:JSON.stringify({type,...data})});
 window.__vpEmit=emit;
 window.__vpStreams=[];
 // Reproduce Safari's failure if a playback-only session reaches capture.
 Object.defineProperty(navigator,'audioSession',{configurable:true,value:{type:'playback'}});
 const realMic=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
 navigator.mediaDevices.getUserMedia=async args=>{if(navigator.audioSession.type!=='play-and-record')throw new DOMException('AudioSession category is not compatible with audio capture.','InvalidStateError');const s=await realMic(args);window.__vpStreams.push(s);return s;};
 window.RTCPeerConnection=class {
   constructor(){this.iceGatheringState='complete';this.localDescription={sdp:'v=0\r\n'};}
   addTrack(){} addEventListener(){} removeEventListener(){} close(){}
   async createOffer(){return {type:'offer',sdp:'v=0\r\n'};}
   async setLocalDescription(){}
   async setRemoteDescription(){channel.onopen();emit('session.created');}
   createDataChannel(){channel={readyState:'open',close(){this.readyState='closed';},send(text){
     const e=JSON.parse(text);if(e.type!=='response.create')return;
     const id='assistant-'+(++counter),closing=e.response?.metadata?.purpose==='closing';
     setTimeout(()=>{
       emit('response.created',{response:{id,metadata:e.response?.metadata||{}}});
       emit('output_audio_buffer.started');
       emit('response.output_audio_transcript.done',{item_id:id,transcript:closing?'Thanks for sharing. See you next time!':'Hi! How did you two become friends?'});
       emit('response.done',{response:{id,status:'completed',output:[],metadata:e.response?.metadata||{}}});
       emit('output_audio_buffer.stopped');
     },50);
   }};return channel;}
 };
})();
"""

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'], timeout=20000)
    context = browser.new_context(viewport={'width':390,'height':1000}, permissions=['microphone'], reduced_motion='reduce')
    context.add_init_script(FAKE_PEER)
    context.route('**/api/pet/**', lambda r:r.fulfill(status=503,json={'error':'Test leaves pet data untouched.'}))
    page = context.new_page()
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    opened=[];records={};transcriptions=[];scenarios=[]
    def route_api(route):
        req=route.request; endpoint=req.url.split('/api/voice-practice')[-1]
        if endpoint=='/config':
            return route.fulfill(json=dict(openai=True,elevenlabs=True,scenes={},grammar=['because','when','what','if','that','even though']))
        if endpoint=='/scene-transcription':
            transcriptions.append(req)
            assert req.headers['content-type'].startswith('audio/')
            assert len(req.post_data_buffer)>100
            return route.fulfill(json={'text':REQUEST})
        if endpoint=='/scenarios':
            scenarios.append(req.post_data_json)
            return route.fulfill(json={'scenario':SCENARIO})
        if endpoint=='/sessions' and req.method=='POST':
            data=req.post_data_json;opened.append(data)
            id='00000000-0000-4000-8000-'+str(len(opened)).zfill(12)
            settings={k:v for k,v in data.items() if k!='sdp'}
            records[id]=dict(id=id,**settings,title=settings['scenario']['title'],createdAt='2026-10-23T10:00:00Z',turns=[],status='active',review={'status':'not_requested'})
            return route.fulfill(json=dict(id=id,sdp='v=0\r\n',settings=settings))
        if endpoint.endswith('/hints'):
            return route.fulfill(json=dict(kind='reply',feedback='',candidates=[dict(english=en,japanese='候補の日本語',fullSentence=en) for en in ['Back in high school, we joined the same club.', 'Our friendship started when we met at school.', 'That was a long time ago, when we were students.']]))
        if endpoint=='/sessions': return route.fulfill(json=list(records.values()))
        parts=endpoint.strip('/').split('/');id=parts[1]
        if endpoint.endswith('/checkpoint'): return route.fulfill(json={'saved':True})
        if endpoint.endswith('/finish'):
            records[id].update(turns=req.post_data_json['turns'],status='finished')
        return route.fulfill(json=records[id])
    page.route('**/api/voice-practice/**',route_api)
    page.goto(BASE+'/',wait_until='domcontentloaded')
    page.locator('.home-ai-entry').wait_for()
    assert page.title()=='Lyric Shadows'
    assert page.locator('.home-tabs button').count()==3
    page.screenshot(path=str(OUT/'voice-scene-home.png'))
    page.locator('.home-ai-entry').click()
    page.wait_for_function("!document.getElementById('scene-record').disabled")
    assert page.locator('.top strong').inner_text()=='Lyric Shadows'
    assert page.locator('#start').is_disabled()
    for width in [320,390,768]:
        page.set_viewport_size({'width':width,'height':1000})
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    page.set_viewport_size({'width':390,'height':1000})
    page.locator('#scene-record').click()
    page.locator('#scene-stop').wait_for(state='visible')
    page.wait_for_timeout(800)
    page.locator('#scene-stop').click()
    page.locator('#scene-confirm').wait_for(state='visible')
    assert len(transcriptions)==1 and scenarios==[{'request':REQUEST}]
    assert not opened, 'confirmation must precede any live connection'
    assert page.evaluate("window.__vpStreams[0].getTracks().every(t=>t.readyState==='ended')")
    assert page.evaluate('navigator.audioSession.type')=='playback'
    page.locator('#scenario-place').fill('友人の家')
    page.locator('#scenario-partnerName').fill('Sam')
    page.locator('#grammar').select_option('when')
    assert page.locator('#assumed-place').is_hidden()
    page.screenshot(path=str(OUT/'voice-scene-confirm.png'),full_page=True)
    for width in [320,390,768]:
        page.set_viewport_size({'width':width,'height':1000})
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    page.locator('#start').click()
    page.locator('#chat .bubble').wait_for()
    assert opened[0]['scenario']['place']=='友人の家'
    assert page.evaluate('navigator.audioSession.type')=='play-and-record'
    assert opened[0]['scenario']['partnerName']=='Sam'
    assert page.locator('#live-partner').inner_text()=='Sam'
    page.locator('#hint').click()
    page.locator('#hints').wait_for(state='visible')
    assert not any(text.startswith(('I ','You ')) for text in page.locator('.hint-card strong').all_inner_texts())
    page.evaluate("""() => {
      __vpEmit('input_audio_buffer.speech_started');
      __vpEmit('input_audio_buffer.committed',{item_id:'user-first'});
      __vpEmit('input_audio_buffer.speech_stopped');
      __vpEmit('conversation.item.input_audio_transcription.completed',{item_id:'user-first',transcript:'We met when we were in high school.'});
    }""")
    page.locator('#end').click()
    page.locator('#review').wait_for(state='visible',timeout=15000)
    assert len(opened)==1
    original=list(records.values())[0].copy()
    assert page.evaluate('navigator.audioSession.type')=='playback'
    page.locator('#retry-practice').click()
    page.wait_for_function("document.querySelector('#chat .bubble')!==null")
    assert len(opened)==2 and opened[1]==opened[0]
    assert page.evaluate('navigator.audioSession.type')=='play-and-record'
    assert len(records)==2
    assert list(records.values())[0]['turns']==original['turns']
    assert 'We met when we were in high school.' not in page.locator('#chat').inner_text()
    assert page.evaluate("window.__vpStreams.slice(0,2).every(s=>s.getTracks().every(t=>t.readyState==='ended'))")
    page.locator('#save-interrupted').evaluate('(e)=>e.hidden=false')
    page.locator('#save-interrupted').click()
    page.locator('#review').wait_for(state='visible')
    page.locator('#home-link').click()
    page.locator('.home-ai-entry').wait_for()
    assert page.url==BASE+'/'
    assert not errors, errors
    print('PASS: real home, actual MediaRecorder with fake mic, transcript -> confirmation, edits, custom role, fresh retry, old history preserved, home return, 320/390/768px layouts.')
    # Permission denial still leaves text input available, and no live session starts.
    page.goto(BASE+'/voice-practice.html',wait_until='domcontentloaded')
    page.wait_for_function("!document.getElementById('scene-record').disabled")
    page.evaluate("() => { navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('Denied','NotAllowedError')}; }")
    page.locator('#scene-back').click()
    page.locator('#scene-record').click()
    page.wait_for_function("document.getElementById('error').textContent.includes('マイクの使用を許可')")
    assert page.locator('#scene-type').is_enabled()
    assert page.evaluate('navigator.audioSession.type')=='playback'
    assert len(opened)==2
    print('PASS: microphone permission failure keeps editable text fallback and does not open a call.')
    page.route('**/api/voice-practice/config',lambda route:route.fulfill(json=dict(openai=False,elevenlabs=True,scenes={},grammar=['because','when'])))
    page.goto(BASE+'/voice-practice.html',wait_until='domcontentloaded')
    page.wait_for_function("document.getElementById('configuration').textContent.includes('設定待ち')")
    if page.locator('#scene-confirm').is_visible(): page.locator('#scene-back').click()
    page.locator('#scene-type').click()
    page.locator('#scene-request').fill('ホテルでチェックインする')
    page.locator('#scene-manual').click()
    assert page.locator('#scene-confirm').is_visible()
    assert page.locator('#assumed-place').inner_text()=='仮の設定'
    assert page.locator('#start').is_disabled()
    page.locator('#scenario-place').fill('ホテルの受付')
    page.reload(wait_until='domcontentloaded')
    page.locator('#scene-confirm').wait_for(state='visible')
    assert page.locator('#scenario-place').input_value()=='ホテルの受付'
    assert page.locator('#assumed-place').is_hidden()
    assert len(opened)==2
    print('PASS: missing-key manual setup, honest default labels, edited draft persistence, and disabled live start.')
    browser.close()
