"""Local real-media integration test. Reuses the complete source checkout for media/dependencies."""
import json, subprocess, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT if (ROOT/'node_modules').is_dir() else ROOT.parent/'英語字幕'
SERVER=r'''
const path=require('node:path'),root=process.argv[1],source=process.argv[2];
const express=require(path.join(source,'node_modules/express'));
const {createState,listen}=require(path.join(source,'lib/pet-store'));
const state=createState(Date.now()),app=express();app.use(express.json());
app.get('/api/pet/:id',async(req,res)=>{await new Promise(r=>setTimeout(r,3000));res.json({...state,serverNow:Date.now()});});
app.post('/api/pet/:id/listen',(req,res)=>{listen(state,req.body.events,Date.now());state.revision++;res.json({...state,serverNow:Date.now()});});
if(process.argv[3]==='baseline')app.get(['/pet.js','/pet-playback.js','/movie-study.js'],(req,res)=>res.sendFile(path.join(source,'public',req.path)));
app.get('/',(req,res)=>res.send(`<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/movie-study.css"><b data-listening-time="today"></b><div id="app"></div>
<script src="/listening-time.js"></script><script src="/pet-rules.js"></script><script src="/pet-art.js"></script><script src="/pet-playback.js"></script><script src="/pet.js"></script>
<script src="/movie-study-data.js"></script><script src="/movie-study-progress.js"></script><script src="/movie-study.js"></script>
<script>PetGame.initialize('movie-listening-local-test');MovieStudy.open({container:document.querySelector('#app'),work:'sunrise',home:()=>MovieStudy.close()});</script>`));
app.use(express.static(path.join(root,'public')));app.use(express.static(path.join(source,'public')));
app.listen(10009,'127.0.0.1',()=>console.log('ready'));
'''
server=subprocess.Popen(['node','-e',SERVER,str(ROOT),str(SOURCE),'baseline' if '--baseline' in sys.argv else 'fixed'],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
try:
    assert server.stdout.readline().strip()=='ready'
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=['--autoplay-policy=no-user-gesture-required'])
        page=browser.new_page(viewport={'width':390,'height':844})
        errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
        page.goto('http://127.0.0.1:10009/')
        page.wait_for_function("document.querySelector('.is-active video')?.currentTime>4.5")
        page.locator('.is-active .play').click()
        playback=page.locator('.is-active video').evaluate('(v)=>v.currentTime')
        display=page.locator('[data-listening-time=today]').inner_text()
        assert display not in ['', '0分00秒','0分01秒','0分02秒'],(display,playback)
        page.evaluate('PetGame.prepareRefresh()')
        saved=page.evaluate('PetGame.getState().totalSeconds')
        assert playback-.8<saved<=playback+.2,(playback,saved)
        page.wait_for_timeout(1100)
        page.evaluate('PetGame.prepareRefresh()')
        assert page.evaluate('PetGame.getState().totalSeconds')==saved
        page.locator('.is-active .sound').click()
        page.locator('.is-active .play').click()
        page.wait_for_timeout(1200)
        page.evaluate('PetGame.prepareRefresh()')
        assert page.evaluate('PetGame.getState().totalSeconds')==saved
        page.evaluate('MovieStudy.close()')
        assert not errors,errors
        print(json.dumps({'slowInitialReadSeconds':3,'actualPlayedSeconds':round(playback,3),'savedSeconds':round(saved,3),'todayDisplay':display,'pausedAndMutedExcluded':True,'pageErrors':errors},ensure_ascii=False))
        browser.close()
finally:
    server.terminate();server.wait(timeout=10)
