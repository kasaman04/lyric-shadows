"""Import a PhraseCue .apkg into the drama library with authored examples."""

import argparse
import html
import json
import re
import sqlite3
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DRAMA_ID = "first-love-2022"
EPISODE_ID = "episode-1"
IMAGE = "https://images.ctfassets.net/4cd45et68cgf/7EyqipRF7tU1NR2qQelBJU/67f2ede1dbc55c29db5a40bf68a8f968/JA_firstlove_main_coupleinsnow_vertical_27x40_rgb_pre_1.jpg?w=960"
IMAGE_SOURCE = "https://about.netflix.com/ja/news/first-love-teaser-art-and-trailer-debut"
WATCH_URL = "https://www.netflix.com/watch/81222255"


def clean_text(value):
    value = re.sub(r"<br\s*/?>", " ", value, flags=re.I)
    value = re.sub(r"<[^>]+>", "", value)
    return " ".join(html.unescape(value).replace("\ufeff", "").split())


def read_examples(path):
    result = {}
    for number, line in enumerate(path.read_text(encoding="utf-8-sig").splitlines(), 1):
        if not line or line.startswith("#"):
            continue
        fields = line.split("\t")
        if len(fields) != 5 or not all(fields):
            raise ValueError(f"{path}:{number}: expected number and two English/Japanese pairs")
        key = int(fields[0])
        if key in result:
            raise ValueError(f"Duplicate example number {key}")
        result[key] = [
            {"english": fields[1], "japanese": fields[2]},
            {"english": fields[3], "japanese": fields[4]},
        ]
    return result


def read_notes(archive):
    database_name = next(name for name in archive.namelist() if name.startswith("collection.anki"))
    connection = sqlite3.connect(":memory:")
    connection.deserialize(archive.read(database_name))
    models = json.loads(connection.execute("SELECT models FROM col").fetchone()[0])
    notes = []
    for model_id, raw_fields in connection.execute("SELECT mid, flds FROM notes"):
        names = [field["name"] for field in models[str(model_id)]["flds"]]
        notes.append(dict(zip(names, raw_fields.split("\x1f"))))
    connection.close()
    return notes


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("package", type=Path)
    parser.add_argument("--examples", type=Path, required=True)
    args = parser.parse_args()
    examples = read_examples(args.examples)

    with zipfile.ZipFile(args.package) as archive:
        media = json.loads(archive.read("media"))
        media_by_name = {filename: member for member, filename in media.items()}
        notes = read_notes(archive)
        if not notes or {note["Netflix URL"] for note in notes} != {WATCH_URL}:
            raise ValueError("This package does not contain the expected episode")
        titles = {clean_text(note["Item Title"]) for note in notes if note["Item Title"] != "Netflix"}
        if titles != {"First Love 初恋エピソード1: リラの花咲く頃"}:
            raise ValueError(f"Episode title mismatch: {titles}")
        notes.sort(key=lambda note: float(note["Start"]))
        if set(examples) != set(range(1, len(notes) + 1)):
            raise ValueError("Examples must cover every phrase exactly once")

        clips = []
        audio_files = []
        for number, note in enumerate(notes, 1):
            match = re.fullmatch(r"\[sound:([^\]]+\.mp3)\]", note["Audio Clip"])
            if not match or match.group(1) not in media_by_name:
                raise ValueError(f"Missing audio for phrase {number}")
            filename = f"{number:02d}.mp3"
            clips.append({
                "english": clean_text(note["Subtitle"]),
                "japanese": clean_text(note["Translation"]),
                "audio": f"/drama-audio/{DRAMA_ID}/{EPISODE_ID}/{filename}",
                "otherExamples": examples[number],
            })
            audio_files.append((media_by_name[match.group(1)], filename))

        destination = ROOT / "public" / "drama-audio" / DRAMA_ID / EPISODE_ID
        destination.mkdir(parents=True, exist_ok=True)
        for member, filename in audio_files:
            (destination / filename).write_bytes(archive.read(member))

    drama = {
        "id": DRAMA_ID,
        "title": "First Love 初恋",
        "image": IMAGE,
        "imageSource": IMAGE_SOURCE,
        "episodes": [{"id": EPISODE_ID, "number": 1, "title": "リラの花咲く頃", "clips": clips}],
    }
    (ROOT / "public" / "dramas.js").write_text(
        "// PhraseCue drama data.\nwindow.DRAMAS = "
        + json.dumps([drama], ensure_ascii=False, indent=2) + ";\n", encoding="utf-8"
    )
    print(f"Imported {len(clips)} audio phrases from PhraseCue")


if __name__ == "__main__":
    main()
