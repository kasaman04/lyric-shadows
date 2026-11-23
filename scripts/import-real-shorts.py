"""Import reviewed, locally acquired real-conversation clips into this app."""
import argparse
import concurrent.futures
import json
import re
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
LABELS={'random':'ランダムチャット','street':'街頭インタビュー','daily':'日常の掛け合い'}
parser=argparse.ArgumentParser()
parser.add_argument('--source',type=Path,default=ROOT.parent/'output/real-conversation-shorts-20261123')
args=parser.parse_args();source=args.source.resolve()
items=json.loads((source/'ready/manifest.json').read_text(encoding='utf-8'))['clips']
registry=ROOT/'data/real-shorts-scenes.json'
existing=json.loads(registry.read_text(encoding='utf-8')) if registry.exists() else []
by_id={scene['id']:scene for scene in existing}
counts={key:0 for key in LABELS}
incoming_ids=set()
for item in items:
    counts[item['category']]+=1
    item.setdefault('nativeId',f"real-{item['category']}-{counts[item['category']]:02}")
    sid=item['nativeId']
    assert re.fullmatch(r'real-'+item['category']+r'-\d{2}',sid),sid
    assert sid not in incoming_ids,('duplicate scene',sid)
    incoming_ids.add(sid)
    assert sid not in by_id or by_id[sid]['sourceVideoId']==item['id'],('existing progress belongs to another video',sid)
    assert item['captions'] and item['duration']>0,sid
    previous_end=0
    for cue in item['captions']:
        assert cue['en'].strip() and cue['ja'].strip(),sid
        assert previous_end<=cue['start']<cue['end']<=item['duration']+.01,(sid,cue)
        previous_end=cue['end']

def caption_english(text,ja):
    text=re.sub(r'\bi\b','I',text.strip())
    text=text[:1].upper()+text[1:]
    if text[-1:] not in '.?!…,:;—-':text+='?' if ja.endswith('？') else '.'
    return text

def build(item):
    sid=item['nativeId'];media=ROOT/'public/real-shorts/media'/(sid+'.mp4');poster=ROOT/'public/real-shorts/posters'/(sid+'.jpg')
    media.parent.mkdir(parents=True,exist_ok=True);poster.parent.mkdir(parents=True,exist_ok=True)
    if not media.exists():
        subprocess.run(['ffmpeg','-y','-nostdin','-v','error','-ss',str(item['start']),'-i',str(source/'source'/(item['id']+'.mp4')),'-t',str(item['duration']),'-map','0:v:0','-map','0:a:0','-vf','scale=-2:1280,setsar=1','-af','loudnorm=I=-16:TP=-1.5:LRA=11','-c:v','libx264','-preset','veryfast','-crf','21','-threads','3','-pix_fmt','yuv420p','-r','30','-c:a','aac','-ar','48000','-b:a','128k','-movflags','+faststart',str(media)],check=True)
    if not poster.exists():
        subprocess.run(['ffmpeg','-v','error','-ss',str(min(4,item['duration']/2)),'-i',str(media),'-vf','scale=360:-2','-frames:v','1','-q:v','3',str(poster)],check=True)
    result={'id':sid,'category':item['category'],'work':'リアル英会話','displayWork':LABELS[item['category']]+' · '+item['creator'],'title':item['title'],'description':LABELS[item['category']],'duration':item['duration'],'source':item['sourceUrl'],'sourceStart':item['start'],'sourceEnd':item['end'],'creator':item['creator'],'sourceVideoId':item['id'],'bakedEnglish':True,'video':'/real-shorts/media/'+media.name,'poster':'/real-shorts/posters/'+poster.name,'captions':[{'id':f'{sid}-cue-{i+1:03}','start':c['start'],'end':c['end'],'speechText':caption_english(c['en'],c['ja']),'language':'en','en':caption_english(c['en'],c['ja']),'ja':c['ja']} for i,c in enumerate(item['captions'])],'subtitleVerification':'source captions reviewed against independent local acoustic recognition; editorial Japanese review; not full human listening'}
    print(json.dumps({'id':sid,'seconds':item['duration'],'captions':len(result['captions'])}),flush=True)
    result['bakedEnglish']=item.get('bakedEnglish',True)
    if item.get('subtitleVerification'):result['subtitleVerification']=item['subtitleVerification']
    return result

with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    imported=list(pool.map(build,items))
for scene in imported:by_id[scene['id']]=scene
published=list(by_id.values())
(ROOT/'data/real-shorts-scenes.json').write_text(json.dumps(published,ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'public/real-shorts-data.js').write_text('window.REAL_SHORT_SCENES = '+json.dumps(published,ensure_ascii=False)+';\n',encoding='utf-8')
print(json.dumps({'scenes':len(published),'groups':counts,'seconds':round(sum(x['duration'] for x in published),3)}))
