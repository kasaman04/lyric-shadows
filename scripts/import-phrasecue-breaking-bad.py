"""Append Breaking Bad's first episode from PhraseCue, preserving existing dramas."""

import argparse
import importlib.util
import json
import re
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("phrasecue", Path(__file__).with_name("import-phrasecue-drama.py"))
phrasecue = importlib.util.module_from_spec(spec)
spec.loader.exec_module(phrasecue)
DRAMA_ID = "breaking-bad"
EPISODE_ID = "episode-1"
WATCH_URL = "https://www.netflix.com/watch/70196252"
TITLE = "ブレイキング・バッドエピソード1: 化学教師 ウォルター・ホワイト"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("package", type=Path)
    args = parser.parse_args()
    examples = phrasecue.read_examples(ROOT / "data/drama-examples/breaking-bad-episode-1.tsv")
    corrections = {}
    for line in (ROOT / "data/drama-examples/breaking-bad-episode-1-corrections.tsv").read_text(encoding="utf-8").splitlines():
        if not line or line.startswith("#"):
            continue
        number, japanese = line.split("\t")
        if int(number) in corrections or not japanese.strip():
            raise ValueError("Duplicate or empty translation")
        corrections[int(number)] = japanese
    drama_path = ROOT / "public/dramas.js"
    source = drama_path.read_text(encoding="utf-8")
    match = re.fullmatch(r"\s*//[^\n]*\nwindow\.DRAMAS\s*=\s*(\[.*\]);\s*", source, re.S)
    if not match:
        raise ValueError("Unrecognized drama data")
    dramas = json.loads(match.group(1))
    if any(drama["id"] == DRAMA_ID for drama in dramas):
        raise ValueError("Breaking Bad is already imported")

    with zipfile.ZipFile(args.package) as archive:
        notes = phrasecue.read_notes(archive)
        if not notes or {note.get("Netflix URL") for note in notes} != {WATCH_URL}:
            raise ValueError("Unexpected Netflix episode")
        titles = {phrasecue.clean_text(note.get("Item Title", "")) for note in notes} - {"Netflix"}
        if titles != {TITLE}:
            raise ValueError(f"Unexpected episode title: {titles}")
        notes.sort(key=lambda note: (float(note["Start"]), note.get("Phrase ID", "")))
        expected = set(range(1, len(notes) + 1))
        if set(examples) != expected or set(corrections) != expected:
            raise ValueError("Every clip requires two examples and an aligned translation")
        media = {name: member for member, name in json.loads(archive.read("media")).items()}
        clips, audio = [], []
        for number, note in enumerate(notes, 1):
            sound = re.fullmatch(r"\[sound:([^\]]+\.mp3)\]", note["Audio Clip"])
            if not sound or sound.group(1) not in media:
                raise ValueError(f"Missing audio for clip {number}")
            filename = f"{number:02d}.mp3"
            audio.append((filename, archive.read(media[sound.group(1)])))
            clips.append({
                "english": phrasecue.clean_text(note["Subtitle"]),
                "japanese": corrections[number],
                "audio": f"/drama-audio/{DRAMA_ID}/{EPISODE_ID}/{filename}",
                "otherExamples": examples[number],
            })
        destination = ROOT / "public/drama-audio" / DRAMA_ID / EPISODE_ID
        destination.mkdir(parents=True, exist_ok=True)
        for filename, data in audio:
            (destination / filename).write_bytes(data)
    dramas.append({
        "id": DRAMA_ID,
        "title": "ブレイキング・バッド",
        "image": "https://www.sonypictures.com/sites/default/files/styles/max_860x460/public/title-key-art/breakingbad_onesheet_1400x2100.png?itok=z0qVAyD8",
        "imageSource": "https://www.sonypictures.com/tv/breakingbad",
        "episodes": [{"id": EPISODE_ID, "number": 1, "title": "化学教師 ウォルター・ホワイト", "clips": clips}],
    })
    drama_path.write_text("// PhraseCue drama data.\nwindow.DRAMAS = " + json.dumps(dramas, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
    print(f"Imported Breaking Bad episode 1: {len(clips)} clips")


if __name__ == "__main__":
    main()
