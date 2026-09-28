"""Add First Love episodes from a PhraseCue APKG without changing existing episodes.

Usage: python scripts/import-phrasecue-episodes.py PACKAGE --examples EXAMPLES
       [--corrections CORRECTIONS]

EXAMPLES is a tab-separated file with episode, clip number, and two English/Japanese
example pairs. CORRECTIONS optionally replaces Japanese display text where the
package's translation does not match its English subtitle.
"""

import argparse
import html
import json
import re
import sqlite3
import zipfile
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DRAMA_ID = "first-love-2022"


def clean_text(value):
    value = re.sub(r"<br\s*/?>", " ", value, flags=re.I)
    value = re.sub(r"<[^>]+>", "", value)
    return " ".join(html.unescape(value).replace("\ufeff", "").split())


def read_tsv(path, columns):
    rows = {}
    if path is None:
        return rows
    for line_number, line in enumerate(path.read_text(encoding="utf-8-sig").splitlines(), 1):
        if not line or line.startswith("#"):
            continue
        fields = line.split("\t")
        if len(fields) != columns or not all(fields):
            raise ValueError(f"{path}:{line_number}: expected {columns} nonempty fields")
        key = int(fields[0]), int(fields[1])
        if key in rows:
            raise ValueError(f"{path}:{line_number}: duplicate episode/clip {key}")
        rows[key] = fields[2:]
    return rows


def read_notes(archive):
    database = next((name for name in archive.namelist() if name.startswith("collection.anki")), None)
    if not database:
        raise ValueError("APKG has no Anki database")
    connection = sqlite3.connect(":memory:")
    connection.deserialize(archive.read(database))
    models = json.loads(connection.execute("SELECT models FROM col").fetchone()[0])
    notes = []
    for model_id, fields in connection.execute("SELECT mid, flds FROM notes"):
        names = [field["name"] for field in models[str(model_id)]["flds"]]
        notes.append(dict(zip(names, fields.split("\x1f"))))
    connection.close()
    return notes


def read_drama(path):
    source = path.read_text(encoding="utf-8")
    match = re.fullmatch(r"\s*//[^\n]*\nwindow\.DRAMAS\s*=\s*(\[.*\]);\s*", source, re.S)
    if not match:
        raise ValueError("Unrecognized dramas.js format")
    dramas = json.loads(match.group(1))
    drama = next((item for item in dramas if item["id"] == DRAMA_ID), None)
    if drama is None:
        raise ValueError(f"Missing drama {DRAMA_ID}")
    return dramas, drama


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("package", type=Path)
    parser.add_argument("--examples", type=Path, required=True)
    parser.add_argument("--corrections", type=Path)
    args = parser.parse_args()
    examples = read_tsv(args.examples, 6)
    corrections = read_tsv(args.corrections, 3)
    dramas_path = ROOT / "public" / "dramas.js"
    dramas, drama = read_drama(dramas_path)
    existing_numbers = {item["number"] for item in drama["episodes"]}

    with zipfile.ZipFile(args.package) as archive:
        media = json.loads(archive.read("media"))
        media_by_name = {filename: member for member, filename in media.items()}
        groups = defaultdict(list)
        for note in read_notes(archive):
            if not all(note.get(key) for key in ("Netflix URL", "Start", "Subtitle", "Audio Clip")):
                raise ValueError("A note is missing a required PhraseCue field")
            groups[note["Netflix URL"]].append(note)
        if not groups:
            raise ValueError("APKG has no notes")

        episodes = []
        audio_files = []
        used_keys = set()
        for watch_url, notes in sorted(groups.items()):
            titles = {clean_text(note["Item Title"]) for note in notes if clean_text(note["Item Title"]) != "Netflix"}
            if len(titles) != 1:
                raise ValueError(f"Expected one episode title for {watch_url}: {titles}")
            title = titles.pop()
            match = re.fullmatch(r"First Love 初恋エピソード(\d+):\s*(.+)", title)
            if not match:
                raise ValueError(f"Unknown drama or episode title: {title}")
            number = int(match.group(1))
            if number in existing_numbers:
                raise ValueError(f"Episode {number} is already in dramas.js")
            episode_id = f"episode-{number}"
            notes.sort(key=lambda note: (float(note["Start"]), note.get("Phrase ID", "")))
            clips = []
            for clip_number, note in enumerate(notes, 1):
                key = number, clip_number
                if key not in examples:
                    raise ValueError(f"Missing two examples for {key}")
                sound = re.fullmatch(r"\[sound:([^\]]+\.mp3)\]", note["Audio Clip"])
                if not sound or sound.group(1) not in media_by_name:
                    raise ValueError(f"Missing audio for {key}")
                filename = f"{clip_number:02d}.mp3"
                clips.append({
                    "english": clean_text(note["Subtitle"]),
                    "japanese": corrections.get(key, [clean_text(note.get("Translation", ""))])[0],
                    "audio": f"/drama-audio/{DRAMA_ID}/{episode_id}/{filename}",
                    "otherExamples": [
                        {"english": examples[key][0], "japanese": examples[key][1]},
                        {"english": examples[key][2], "japanese": examples[key][3]},
                    ],
                })
                audio_files.append((media_by_name[sound.group(1)], episode_id, filename))
                used_keys.add(key)
            episodes.append({"id": episode_id, "number": number, "title": match.group(2), "clips": clips})
        if used_keys != set(examples):
            raise ValueError(f"Unexpected examples: {sorted(set(examples) - used_keys)}")
        if not set(corrections) <= used_keys:
            raise ValueError(f"Unexpected corrections: {sorted(set(corrections) - used_keys)}")

        for member, episode_id, filename in audio_files:
            destination = ROOT / "public" / "drama-audio" / DRAMA_ID / episode_id / filename
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(archive.read(member))

    drama["episodes"].extend(episodes)
    drama["episodes"].sort(key=lambda episode: episode["number"])
    dramas_path.write_text(
        "// PhraseCue drama data.\nwindow.DRAMAS = "
        + json.dumps(dramas, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )
    print("Imported " + ", ".join(f"episode {episode['number']}: {len(episode['clips'])} clips" for episode in episodes))


if __name__ == "__main__":
    main()
