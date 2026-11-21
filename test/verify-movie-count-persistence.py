"""Exercise the full app's movie identity and recovery with isolated mock APIs."""
import json, subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT if (ROOT/'node_modules').is_dir() else ROOT.parent/'英語字幕'
DEVICE='12345678-1234-4234-8234-123456789abc'
SERVER=r'''
const path=require('node:path'),root=process.argv[1],source=process.argv[2];
const express=require(path.join(source,'node_modules/express')),{createState}=require(path.join(source,'lib/pet-store'));
const app=express(),state=createState(Date.now());app.use(express.json());
app.all('/api/pet/:id/movies',(req,res)=>res.json({baseline:{'train-invitation':7},replicas:{}}));
app.all('/api/pet/:id',(req,res)=>res.json({...state,serverNow:Date.now()}));
app.get(['/api/songs','/api/voices'],(req,res)=>res.json([]));
app.get('/api/phrase-preferences/:id',(req,res)=>res.json({enabled:false}));
app.use(express.static(path.join(root,'public')));app.use(express.static(path.join(source,'public')));
app.listen(10010,'127.0.0.1',()=>console.log('ready'));
'''
server=subprocess.Popen(['node','-e',SERVER,str(ROOT),str(SOURCE)],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
try:
    assert server.stdout.readline().strip()=='ready'
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        context=browser.new_context(viewport={'width':390,'height':844})
        page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        online=False
        def movies(route):
            if online:route.continue_()
            else:route.fulfill(status=503,json={'error':'connection unavailable'})
        page.route('**/api/pet/*/movies',movies)
        page.goto('http://127.0.0.1:10010/?scene=train-invitation&work=sunrise#saved-device='+DEVICE)
        page.evaluate("showMovieStudy('sunrise')")
        label=page.locator('.scene.is-active .watch-count')
        page.wait_for_function("document.querySelector('.is-active .watch-count')?.textContent.includes('確認できません')")
        assert '0 / 100' not in label.inner_text()
        assert page.evaluate('new URL(location.href).searchParams.get("saved-device")')==DEVICE
        online=True;page.evaluate("window.dispatchEvent(new Event('online'))")
        page.wait_for_function("document.querySelector('.is-active .watch-count')?.textContent==='聞いた回数 7 / 100回'")
        # Reload the same movie URL after both identity storage mechanisms vanish.
        page.evaluate('localStorage.clear()');context.clear_cookies();page.reload()
        page.wait_for_function("document.querySelector('.is-active .watch-count')?.textContent==='聞いた回数 7 / 100回'")
        assert page.evaluate('localStorage.getItem("phraseDeviceId")')==DEVICE
        # The second ledger copy must survive a damaged primary even offline.
        page.evaluate('(id)=>localStorage.setItem("movie-study-completions-v1:cloud:"+id,"broken")',DEVICE)
        online=False;page.reload()
        page.wait_for_function("document.querySelector('.is-active .watch-count')?.textContent.includes('7 / 100回 · 未同期')")
        assert not errors,errors
        print(json.dumps({'offlineNeverShowsFalseZero':True,'recoveredCount':7,'identitySurvivesStorageClear':True,'damagedLedgerRecoveredOffline':True,'pageErrors':errors}))
        browser.close()
finally:
    server.terminate();server.wait(timeout=10)
