"""Append Too Hot to Handle episode 1 from a verified PhraseCue package."""

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
DRAMA_ID = "too-hot-to-handle-2020"
EPISODE_ID = "episode-1"
WATCH_URL = "https://www.netflix.com/watch/80240786"
TITLE = "ザ・ジレンマ: もうガマンできない?!"
EPISODE_TITLE = "愛かセックスか賞金か"
IMAGE_SOURCE = "https://www.netflix.com/tudum/articles/too-hot-to-handle-season-1-cast-instagrams"
IMAGE = "https://dnm.nflximg.net/api/v6/s0XAg4q_jvYbSSbLvySyUsliNSg/AAAAQexMWUVqsSbuL16UyD2s5ZfHVs2xhsb6RrkIw5jG180F6ggc3Uy14Q35D-D_cCvCpNFn7hKskB9pymgthvCay707DgwCmW0HrD-zujSe3CE_scifw7UE7lnlqIGP7raNYy5h1CBgvzh92VFL6eS2V09oASc.jpg?r=1e2"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("package", type=Path)
    args = parser.parse_args()
    example_base = ROOT / "data/drama-examples/too-hot-to-handle-episode-1"
    examples = phrasecue.read_examples(example_base.with_suffix(".tsv"))
    corrections = {}
    for line in example_base.with_name(example_base.name + "-corrections.tsv").read_text(encoding="utf-8").splitlines():
        if not line or line.startswith("#"):
            continue
        number, japanese = line.split("\t")
        if int(number) in corrections or not japanese.strip():
            raise ValueError("Duplicate or empty translation")
        corrections[int(number)] = japanese
    drama_path = ROOT / "public/dramas.js"
    match = re.fullmatch(r"\s*//[^\n]*\nwindow\.DRAMAS\s*=\s*(\[.*\]);\s*", drama_path.read_text(encoding="utf-8"), re.S)
    if not match:
        raise ValueError("Unrecognized drama data")
    dramas = json.loads(match.group(1))
    if any(drama["id"] == DRAMA_ID for drama in dramas):
        raise ValueError("Too Hot to Handle is already imported")

    with zipfile.ZipFile(args.package) as archive:
        notes = phrasecue.read_notes(archive)
        if not notes or {note.get("Netflix URL") for note in notes} != {WATCH_URL}:
            raise ValueError("Unexpected Netflix episode")
        titles = {phrasecue.clean_text(note.get("Item Title", "")) for note in notes} - {"Netflix"}
        if titles != {f"{TITLE}エピソード1: {EPISODE_TITLE}"}:
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
            data = archive.read(media[sound.group(1)])
            if not data:
                raise ValueError(f"Empty audio for clip {number}")
            audio.append((filename, data))
            clips.append({"english": phrasecue.clean_text(note["Subtitle"]), "japanese": corrections[number], "audio": f"/drama-audio/{DRAMA_ID}/{EPISODE_ID}/{filename}", "otherExamples": examples[number]})
        destination = ROOT / "public/drama-audio" / DRAMA_ID / EPISODE_ID
        destination.mkdir(parents=True, exist_ok=True)
        for filename, data in audio:
            (destination / filename).write_bytes(data)
    dramas.append({"id": DRAMA_ID, "title": TITLE, "image": IMAGE, "imageSource": IMAGE_SOURCE, "episodes": [{"id": EPISODE_ID, "number": 1, "title": EPISODE_TITLE, "clips": clips}]})
    drama_path.write_text("// PhraseCue drama data.\nwindow.DRAMAS = " + json.dumps(dramas, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
    print(f"Imported Too Hot to Handle episode 1: {len(clips)} clips")


if __name__ == "__main__":
    main()
