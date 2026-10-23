"""Regression: replace a restored scene through voice or text before opening a call.
Uses a fake browser microphone and mocked APIs; no user audio or saved data is used.
"""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'tmp'
BASE = 'http://127.0.0.1:10001'
old = dict(request='初めて会う友達と。', title='初めて会う友達とのあいさつ', relationship='初対面の相手', place='静かなカフェ', time='午後', partnerName='ユウ', context='友人に紹介される。', assumed=['place', 'time', 'partnerName'])
saved = dict(request=old['request'], settings=dict(scene='custom', scenario=old, mode='free', grammar='because'), manual=False, view='confirm')
seed = 'if(!localStorage.getItem("vp-choice-test-seeded")){localStorage.setItem("vp-choice-test-seeded","1");localStorage.setItem("vp-scenario-draft",' + json.dumps(json.dumps(saved, ensure_ascii=False)) + ');}'

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'])
    context = browser.new_context(viewport={'width':390, 'height':844}, permissions=['microphone'], reduced_motion='reduce')
    context.add_init_script(seed)
    context.route('**/api/pet/**', lambda route: route.fulfill(status=503, json={'error':'Test does not alter pet data.'}))
    page = context.new_page()
    errors, requests = [], []
    page.on('pageerror', lambda error: errors.append(str(error)))
    def api(route):
        endpoint = route.request.url.split('/api/voice-practice')[-1]
        requests.append(endpoint)
        if endpoint == '/config':
            return route.fulfill(json=dict(openai=True, elevenlabs=True, scenes={}, grammar=['because','when']))
        if endpoint == '/scene-transcription':
            assert len(route.request.post_data_buffer)>100
            return route.fulfill(json={'text':'海外旅行でホテルにチェックインする'})
        if endpoint == '/scenarios':
            request = route.request.post_data_json['request']
            return route.fulfill(json={'scenario':dict(request=request, title=request, relationship='初対面のスタッフ', place='ホテルの受付' if 'ホテル' in request else '学校', time='午後', partnerName='Alex', context='指定された場面であいさつする。', assumed=[])})
        raise AssertionError('Scene changes must not open a call: '+endpoint)
    page.route('**/api/voice-practice/**', api)
    page.goto(BASE+'/voice-practice.html', wait_until='domcontentloaded')
    page.locator('#scene-confirm').wait_for(state='visible')
    for width in [320,390,768]:
        page.set_viewport_size({'width':width,'height':844})
        box = page.locator('#scene-change').bounding_box()
        assert box['height']>=44 and box['y']+box['height']<844
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    page.set_viewport_size({'width':390,'height':844})
    page.screenshot(path=str(OUT/'voice-scene-change-confirm.png'), full_page=True)
    page.locator('#scene-change').click()
    assert page.locator('#scene-input').is_visible()
    assert page.locator('#scene-confirm').is_hidden()
    assert page.evaluate('VoiceSceneSetup.getSettings()') is None
    draft = page.evaluate('JSON.parse(localStorage.getItem("vp-scenario-draft"))')
    assert draft['view']=='input' and draft['settings'] is None
    page.reload(wait_until='domcontentloaded')
    page.locator('#scene-record:not([disabled])').wait_for()
    assert page.locator('#scene-confirm').is_hidden(), 'Reload must not resurrect the old confirmation'
    page.screenshot(path=str(OUT/'voice-scene-change-input.png'), full_page=True)
    page.locator('#scene-record').click()
    page.locator('#scene-stop').wait_for(state='visible')
    page.wait_for_timeout(800)
    page.locator('#scene-stop').click()
    page.locator('#scene-confirm').wait_for(state='visible')
    assert page.locator('#scenario-place').input_value()=='ホテルの受付'
    assert page.evaluate('VoiceSceneSetup.getSettings().scenario.request')=='海外旅行でホテルにチェックインする'
    page.locator('#scene-change').click()
    page.locator('#scene-request').fill('学校で先生と話す')
    page.locator('#scene-generate').click()
    page.locator('#scene-confirm').wait_for(state='visible')
    assert page.locator('#scenario-place').input_value()=='学校'
    page.locator('#scene-back').click()
    assert page.locator('#scene-input').is_visible()
    assert page.locator('#scene-request').input_value()=='学校で先生と話す'
    assert not errors, errors
    assert all(not endpoint.startswith('/sessions') for endpoint in requests)
    print('PASS: visible 44px scene-change button at 320/390/768px, restored scene -> input, reload stays on input, new voice/text scene replaces old settings, lower back button works, no call starts.')
    browser.close()
