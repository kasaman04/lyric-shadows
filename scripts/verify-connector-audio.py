"""Decode and transcribe generated dialogue locally without uploading audio."""
import difflib
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tmp' / 'pydeps'))
from faster_whisper import WhisperModel
import numpy as np

OUTPUT = ROOT.parent / 'output' / 'conversation-connectors-20261105'
PACK = json.loads((ROOT / 'data/conversation-connectors-additions.json').read_text(encoding='utf-8'))
MANIFEST = json.loads((OUTPUT / 'audio' / 'manifest.json').read_text(encoding='utf-8'))
REPORT = ROOT / 'data' / 'conversation-connectors-audio-check.json'
model = WhisperModel('base.en', device='cpu', compute_type='int8', cpu_threads=4,
                     download_root=str(ROOT / 'tmp' / 'whisper-models'), local_files_only=True)
compact = lambda text: re.sub('[^a-z0-9]', '', text.lower())
report = []
if REPORT.exists():
    report = json.loads(REPORT.read_text(encoding='utf-8'))
by_id = {item['id']: item for item in report}
for conversation in PACK['conversations']:
    entry = MANIFEST['conversations'].get(conversation['id'])
    if entry is None:
        continue
    old = by_id.get(conversation['id'])
    if old and old.get('sourceHash') == entry['sourceHash']:
        continue
    source = OUTPUT / entry['src']
    decoded = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(source), '-f', 'f32le', '-ac', '1', '-ar', '16000', 'pipe:1'],
                             check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, creationflags=subprocess.CREATE_NO_WINDOW)
    samples = np.frombuffer(decoded.stdout, dtype=np.float32)
    duration = len(samples) / 16000
    assert abs(duration - entry['duration']) < 0.15, conversation['id']
    assert np.max(np.abs(samples)) > 0.01, conversation['id']
    segments, _ = model.transcribe(samples, language='en', beam_size=5, condition_on_previous_text=False)
    transcript = ' '.join(segment.text.strip() for segment in segments)
    expected = ' '.join(turn['en'] for turn in conversation['turns'])
    similarity = difflib.SequenceMatcher(None, compact(expected), compact(transcript), autojunk=False).ratio()
    expression_heard = compact(conversation['type']) in compact(transcript)
    item = {'id': conversation['id'], 'sourceHash': entry['sourceHash'], 'duration': round(duration, 3),
            'method': 'offline-faster-whisper-base.en', 'transcript': transcript,
            'textSimilarity': round(similarity, 4), 'targetExpressionHeard': expression_heard,
            'needsReview': similarity < 0.88 or not expression_heard}
    by_id[conversation['id']] = item
    REPORT.write_text(json.dumps(list(by_id.values()), ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'checked': len(by_id), 'id': item['id'], 'similarity': item['textSimilarity'], 'needsReview': item['needsReview']}), flush=True)
print(json.dumps({'checked': len(by_id), 'flagged': [item['id'] for item in by_id.values() if item['needsReview']],
                  'pendingAudio': len(PACK['conversations']) - len(MANIFEST['conversations'])}), flush=True)
