"""Append a verified Breaking Bad episode from PhraseCue, preserving existing data."""

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
EPISODES = {
    1: ("https://www.netflix.com/watch/70196252", "化学教師 ウォルター・ホワイト"),
    2: ("https://www.netflix.com/watch/70196253", "新しい相棒"),
    3: ("https://www.netflix.com/watch/70196254", "人間の成分"),
    4: ("https://www.netflix.com/watch/70196255", "家族への告知"),
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("package", type=Path)
    parser.add_argument("--episode", type=int, choices=EPISODES, default=1)
    args = parser.parse_args()
    episode_id = f"episode-{args.episode}"
    watch_url, episode_title = EPISODES[args.episode]
    title = f"ブレイキング・バッドエピソード{args.episode}: {episode_title}"
    example_base = ROOT / "data/drama-examples" / f"breaking-bad-{episode_id}"
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
    source = drama_path.read_text(encoding="utf-8")
    match = re.fullmatch(r"\s*//[^\n]*\nwindow\.DRAMAS\s*=\s*(\[.*\]);\s*", source, re.S)
    if not match:
        raise ValueError("Unrecognized drama data")
    dramas = json.loads(match.group(1))
    drama = next((item for item in dramas if item["id"] == DRAMA_ID), None)
    if drama and any(episode["id"] == episode_id or episode["number"] == args.episode for episode in drama["episodes"]):
        raise ValueError(f"Breaking Bad episode {args.episode} is already imported")

    with zipfile.ZipFile(args.package) as archive:
        notes = phrasecue.read_notes(archive)
        if not notes or {note.get("Netflix URL") for note in notes} != {watch_url}:
            raise ValueError("Unexpected Netflix episode")
        titles = {phrasecue.clean_text(note.get("Item Title", "")) for note in notes} - {"Netflix"}
        if titles != {title}:
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
                "audio": f"/drama-audio/{DRAMA_ID}/{episode_id}/{filename}",
                "otherExamples": examples[number],
            })
        destination = ROOT / "public/drama-audio" / DRAMA_ID / episode_id
        destination.mkdir(parents=True, exist_ok=True)
        for filename, data in audio:
            (destination / filename).write_bytes(data)
    if drama is None:
        drama = {
            "id": DRAMA_ID,
            "title": "ブレイキング・バッド",
            "image": "https://www.sonypictures.com/sites/default/files/styles/max_860x460/public/title-key-art/breakingbad_onesheet_1400x2100.png?itok=z0qVAyD8",
            "imageSource": "https://www.sonypictures.com/tv/breakingbad",
            "episodes": [],
        }
        dramas.append(drama)
    drama["episodes"].append({"id": episode_id, "number": args.episode, "title": episode_title, "clips": clips})
    drama["episodes"].sort(key=lambda episode: episode["number"])
    drama_path.write_text("// PhraseCue drama data.\nwindow.DRAMAS = " + json.dumps(dramas, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
    print(f"Imported Breaking Bad episode {args.episode}: {len(clips)} clips")


if __name__ == "__main__":
    main()
