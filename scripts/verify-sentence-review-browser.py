"""Review notebook UI, with fake upstreams and no access to a real microphone."""
import io, json, os, wave
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'tmp'/'sentence-review-browser';OUT.mkdir(parents=True,exist_ok=True)
items=[dict(id='who-1',sentences=['I met a man.','He lives in Tokyo.'],sentenceJapanese=['私は男性に会いました。','彼は東京に住んでいます。']),dict(id='when-13',sentences=['I remember the day.','We first met on that day.'],sentenceJapanese=['私はその日を覚えています。','私たちはその日に初めて会いました。'])]
answers={
 'who-1':dict(reference='I met a man who lives in Tokyo.',japanese='東京に住んでいる男性に会いました。',type='who',explanation='who 以下で、どんな男性かを説明します。'),
 'when-13':dict(reference='I remember the day when we first met.',japanese='初めて会った日を覚えています。',type='when',explanation='when 以下で、どの日かを説明します。')}
buf=io.BytesIO()
with wave.open(buf,'wb') as w:
 w.setnchannels(1);w.setsampwidth(2);w.setframerate(24000);w.writeframes(b'\0\0'*12000)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 ctx=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
 ctx.add_init_script('window.micCalls=0;navigator.mediaDevices.getUserMedia=async()=>{micCalls++;throw Error("Review must never acquire a microphone")};')
 ctx.route('**/api/pet/**',lambda r:r.fulfill(status=503,json={'error':'Mock pet API'}))
 paths=[];pending=[];delay=False;receipts=set();review_ids=[];fail_reveal=False;fail_delete=False
 def goal():return dict(count=len(receipts),met=len(receipts)>=10,policy="both",petId=None)
 def api(r):
  global delay,fail_reveal,fail_delete,items
  path=r.request.url.split('/api/sentence-game/')[-1];paths.append(path)
  if path=='config':return r.fulfill(json=dict(openai=True,elevenlabs=True,types=[],reviewCount=len(items),onsetTimeoutMs=5000,silenceMs=1600,maxRecordingMs=45000,dailyPractice=goal()))
  if path=='practice':return r.fulfill(json=dict(reviewCount=len(items),dailyPractice=goal()))
  if path=='review':return r.fulfill(json=dict(items=items,count=len(items),importPending=False))
  if path=='audio/review':return r.fulfill(body=buf.getvalue(),content_type='audio/wav')
  parts=path.split('/')
  if len(parts)==3 and parts[0]=='review':
   if parts[2]=='delete':
    if fail_delete:fail_delete=False;return r.fulfill(status=503,json={'error':'削除を保存できませんでした。もう一度お試しください。'})
    items=[item for item in items if item['id']!=parts[1]]
    return r.fulfill(json=dict(items=items,count=len(items),importPending=False))
   if parts[2]=='reveal':
    if delay:pending.append(r);delay=False;return
    request_id=r.request.post_data_json['requestId'];review_ids.append(request_id);receipts.add(request_id)
    if fail_reveal:fail_reveal=False;return r.fulfill(status=503,json={'error':'一時的な接続エラー'})
    return r.fulfill(json=dict(**answers[parts[1]],reviewCounted=True,dailyPractice=goal()))
   if parts[2]=='audio':return r.fulfill(json=dict(url='/api/sentence-game/audio/review',duration=.5,cues=[]))
  raise AssertionError(path)
 ctx.route('**/api/sentence-game/**',api)
 page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('REVIEW_BASE_URL','http://127.0.0.1:10001')+'/sentence-game.html',wait_until='domcontentloaded')
 page.locator('#review-tab').click();page.locator('.review-list-card').first.wait_for()
 assert page.locator('.review-list-card').count()==2
 page.screenshot(path=str(OUT/'list.png'),full_page=True)
 page.locator('.review-list-open').first.click()
 assert page.locator('#review-text-0').inner_text()=='I met a man.'
 assert page.locator('#review-text-1').inner_text()=='He lives in Tokyo.'
 for i in [0,1]:
  assert page.locator('#review-translation-'+str(i)).is_visible()
  assert page.locator('#review-translation-'+str(i)).inner_text()==items[0]['sentenceJapanese'][i]
 assert page.locator('#practice-goal').is_visible()
 assert page.locator('#review-answer').is_hidden()
 assert page.locator('#review-japanese').is_hidden()
 assert not page.locator('#review-reference').inner_text()
 page.screenshot(path=str(OUT/'before-answer.png'),full_page=True)
 page.locator('#review-question-audio').click()
 page.wait_for_function('document.querySelector("#review-audio").ended')
 assert page.evaluate('micCalls')==0
 page.locator('#review-reveal').click();page.locator('#review-answer').wait_for(state='visible')
 assert page.locator('#review-reference').inner_text()==answers['who-1']['reference']
 assert page.locator('#review-japanese').inner_text()==answers['who-1']['japanese']
 assert page.locator('#review-japanese').is_visible()
 assert page.locator('#practice-count').inner_text()=='1 / 10回'
 assert page.locator('#review-practice-status').inner_text()=='復習を1回として数えました。'
 for width in [320,390,768]:
  page.set_viewport_size({'width':width,'height':844})
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.set_viewport_size({'width':390,'height':844})
 page.screenshot(path=str(OUT/'after-answer.png'),full_page=True)
 page.locator('#review-answer-audio').click()
 page.wait_for_function('document.querySelector("#review-audio").ended')
 assert page.evaluate('micCalls')==0
 page.locator('#review-answer-audio').click()
 page.wait_for_function('document.querySelector("#review-audio").ended')
 assert paths.count('review/who-1/audio')==2, 'Repeated answer playback reuses the existing sound metadata'
 page.locator('#review-reveal').click();assert page.locator('#review-answer').is_hidden()
 assert page.locator('#review-japanese').is_hidden()
 assert page.locator('#review-translation-0').is_visible()
 page.locator('#review-reveal').click();page.locator('#review-answer').wait_for(state='visible')
 assert len(receipts)==1, 'Showing the same answer again must not count twice'
 page.locator('#review-reveal').click()
 delay=True;page.locator('#review-reveal').click()
 page.wait_for_function('document.querySelector("#review-reveal").disabled')
 page.locator('#review-next').click()
 assert page.locator('#review-text-0').inner_text()==items[1]['sentences'][0]
 assert page.locator('#review-translation-0').inner_text()==items[1]['sentenceJapanese'][0]
 assert page.locator('#review-translation-1').inner_text()==items[1]['sentenceJapanese'][1]
 assert pending
 pending.pop().fulfill(json=answers['who-1'])
 page.wait_for_timeout(100)
 assert page.locator('#review-answer').is_hidden(), 'A late reveal for the previous card must not expose an answer on the next card'
 assert not page.locator('#review-reference').inner_text()
 assert not page.locator('#review-japanese').inner_text()
 page.locator('#review-reveal').click();page.locator('#review-answer').wait_for(state='visible')
 page.locator('#review-answer-audio').click()
 page.wait_for_function('!document.querySelector("#review-audio").paused')
 page.locator('#review-reveal').click()
 assert page.evaluate('document.querySelector("#review-audio").paused'), 'Hiding the answer stops its audio'
 page.locator('#review-back').click();assert page.locator('.review-list-card').count()==2
 page.reload();page.locator('#review-tab').click();page.locator('.review-list-card').first.wait_for()
 assert page.locator('.review-list-card').count()==2
 page.locator('#practice-tab').click();assert page.locator('#setup').is_visible()
 assert page.locator('#review-panel').is_hidden()
 assert not any(x.startswith('attempts') for x in paths), 'Review must not submit a voice answer'
 # Repeat one saved problem ten times, including a retry after a lost response.
 receipts.clear();page.locator('#review-tab').click();page.locator('.review-list-open').first.click()
 fail_reveal=True;page.locator('#review-reveal').click();page.locator('#review-error').wait_for(state='visible')
 failed_id=review_ids[-1]
 page.locator('#review-reveal').click();page.locator('#review-answer').wait_for(state='visible')
 assert review_ids[-1]==failed_id
 assert page.locator('#practice-count').inner_text()=='1 / 10回'
 for count in range(2,11):
  page.locator('#review-repeat').click()
  assert page.locator('#review-answer').is_hidden()
  page.locator('#review-reveal').click();page.locator('#review-answer').wait_for(state='visible')
  assert page.locator('#practice-count').inner_text()==str(count)+' / 10回'
 assert page.locator('#practice-label').inner_text()=='今日の10回、達成！'
 assert len(receipts)==10
 page.screenshot(path=str(OUT/'ten-reviews-complete.png'),full_page=True)
 page.locator('#review-back').click()
 for width in [320,390,768]:
  page.set_viewport_size({'width':width,'height':844})
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  for button in page.locator('.review-delete').all():
   assert button.bounding_box()['height']>=44
 page.set_viewport_size({'width':390,'height':844})
 page.screenshot(path=str(OUT/'delete-list.png'),full_page=True)
 # Cancel leaves the notebook intact and sends no mutation.
 before_delete=len(paths)
 page.once('dialog',lambda dialog:dialog.dismiss())
 page.locator('.review-delete').first.click()
 assert page.locator('.review-list-card').count()==2
 assert len(paths)==before_delete
 # A failed save leaves the card visible and exposes an error in list view.
 fail_delete=True;page.once('dialog',lambda dialog:dialog.accept())
 page.locator('.review-delete').first.click()
 page.locator('#review-error').wait_for(state='visible')
 assert page.locator('.review-list-card').count()==2
 assert page.locator('#review-reader').is_hidden()
 page.once('dialog',lambda dialog:dialog.accept());page.locator('.review-delete').first.click()
 page.wait_for_function('document.querySelectorAll(".review-list-card").length===1')
 assert page.locator('#review-count').inner_text()=='(1)'
 assert page.locator('#practice-count').inner_text()=='10 / 10回'
 page.reload();page.locator('#review-tab').click();page.locator('.review-list-card').wait_for()
 assert page.locator('.review-list-card').count()==1
 page.locator('.review-list-open').click()
 assert page.locator('#review-position').inner_text()=='問題 1 / 1'
 assert page.locator('#review-prev').is_disabled() and page.locator('#review-next').is_disabled()
 page.locator('#review-back').click()
 page.once('dialog',lambda dialog:dialog.accept());page.locator('.review-delete').click()
 page.wait_for_function('document.querySelectorAll(".review-list-card").length===0')
 assert page.locator('#review-count').is_hidden()
 assert page.locator('#review-first').is_hidden()
 assert 'まだ保存された問題はありません' in page.locator('#review-loading').inner_text()
 page.screenshot(path=str(OUT/'deleted-empty.png'),full_page=True)
 page.reload();page.locator('#review-tab').click()
 page.wait_for_function('document.querySelector("#review-loading").textContent.includes("まだ保存された問題はありません")')
 assert page.locator('.review-list-card').count()==0
 assert page.evaluate('micCalls')==0
 assert not errors,errors
 print(json.dumps(dict(result='PASS',savedQuestions=2,sourceTranslations=True,answerTranslationHiddenUntilTap=True,answerAudio=True,retainsBothSentences=True,microphoneRequests=0,tenReviewsMeetGoal=True,retriesCountOnce=True,deleteCancelAndFailure=True,deletePersists=True,deleteCountAndEmptyState=True,viewports=[320,390,768],images=str(OUT))))
 browser.close()
