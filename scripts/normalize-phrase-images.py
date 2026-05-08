from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIR = ROOT / "public" / "phrase-images" / "phrases"
TARGET_RATIO = 16 / 9
TARGET_WIDTH = 1200
WEBP_QUALITY = 82


def center_crop_to_ratio(img, ratio):
    width, height = img.size
    current = width / height

    if abs(current - ratio) < 0.01:
        return img

    if current > ratio:
        new_width = int(height * ratio)
        left = (width - new_width) // 2
        return img.crop((left, 0, left + new_width, height))

    new_height = int(width / ratio)
    top = (height - new_height) // 2
    return img.crop((0, top, width, top + new_height))


def normalize(path):
    with Image.open(path) as source:
      img = source.convert("RGB")
      img = center_crop_to_ratio(img, TARGET_RATIO)
      if img.width > TARGET_WIDTH:
          target_height = round(TARGET_WIDTH / TARGET_RATIO)
          img = img.resize((TARGET_WIDTH, target_height), Image.Resampling.LANCZOS)

      out = path.with_suffix(".webp")
      img.save(out, "WEBP", quality=WEBP_QUALITY, method=6)
      return out


def main():
    files = sorted(
        list(IMAGE_DIR.glob("*.png"))
        + list(IMAGE_DIR.glob("*.jpg"))
        + list(IMAGE_DIR.glob("*.jpeg"))
    )

    for path in files:
        out = normalize(path)
        print(f"{path.name} -> {out.name}")

    print(f"Normalized {len(files)} image(s).")


if __name__ == "__main__":
    main()
