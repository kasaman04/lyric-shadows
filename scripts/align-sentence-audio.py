"""Offline alignment of authored sentences to the cached synthesized WAVs."""
import json
import re
import sys
import subprocess
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tmp' / 'pydeps'))
from faster_whisper import WhisperModel
from faster_whisper.audio import pad_or_trim
from faster_whisper.tokenizer import Tokenizer
import numpy as np

model = WhisperModel(os.environ.get('SENTENCE_ALIGN_MODEL', 'base.en'), device='cpu', compute_type='int8', cpu_threads=4, download_root=str(ROOT / 'tmp/whisper-models'), local_files_only=True)
tokenizer = Tokenizer(model.hf_tokenizer, multilingual=False)
questions = json.loads((ROOT / 'data/sentence-game-questions.json').read_text(encoding='utf-8'))
manifest = json.loads((ROOT / 'data/sentence-game-audio.json').read_text(encoding='utf-8'))
if '--sample' in sys.argv:
    questions = [q for q in questions if q['id'] in ('however-extra-021', 'however-extra-001', 'whom-extra-001')]

def compact(text):
    return re.sub('[^a-z0-9]', '', text.lower())

done = 0
for q in questions:
    entry = manifest['questions'][q['id']]
    source = ROOT / 'tmp/sentence-expansion/audio-cache' / (entry['fullAudioId'] + '.wav')
    target = source.with_suffix('.precise-cues.json')
    if target.exists():
        done += 1
        continue
    decoded = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(source), '-f', 'f32le', '-ac', '1', '-ar', '16000', 'pipe:1'], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, creationflags=subprocess.CREATE_NO_WINDOW)
    audio = np.frombuffer(decoded.stdout, dtype=np.float32)
    features = model.feature_extractor(audio)
    encoded = model.encode(pad_or_trim(features))
    texts = q['sentences'] + [q['answer']]
    alignment = model.find_alignment(tokenizer, [tokenizer.encode(' '.join(texts))], encoded, len(audio) // 160)[0]
    assert compact(''.join(w['word'] for w in alignment)) == compact(''.join(texts)), q['id']
    cursor = 0
    units = []
    for w in alignment:
        size = len(compact(w['word']))
        if size:
            units.append({**w, 'from': cursor, 'to': cursor + size})
            cursor += size
    cues = []
    cursor = 0
    for i, text in enumerate(texts):
        start = cursor
        cursor += len(compact(text))
        matched = [w for w in units if w['to'] > start and w['from'] < cursor]
        cue = {'index': i, 'start': float(matched[0]['start']), 'end': float(matched[-1]['end'])}
        assert 0 <= cue['start'] < cue['end'] <= len(audio) / 16000 + 0.1, (q['id'], cue)
        cues.append(cue)
    record = {'method': 'faster-whisper-base.en-forced-alignment', 'cues': cues,
              'words': [{k: float(v) if k in ('start', 'end', 'probability') else v for k, v in w.items() if k in ('word', 'start', 'end', 'probability')} for w in alignment]}
    target.write_text(json.dumps(record, ensure_ascii=False), encoding='utf-8')
    done += 1
    if done % 25 == 0 or '--sample' in sys.argv:
        print(json.dumps({'aligned': done, 'total': len(questions), 'id': q['id'], 'cues': cues if '--sample' in sys.argv else None}), flush=True)
print(json.dumps({'aligned': done, 'total': len(questions), 'complete': done == len(questions)}), flush=True)
