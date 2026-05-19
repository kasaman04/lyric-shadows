from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import argparse


def fit_to_card(img, target_w, target_h):
    src_w, src_h = img.size
    ratio = target_w / target_h
    if src_w / src_h > ratio:
        new_w = int(src_h * ratio)
        left = (src_w - new_w) // 2
        img = img.crop((left, 0, left + new_w, src_h))
    else:
        new_h = int(src_w / ratio)
        top = (src_h - new_h) // 2
        img = img.crop((0, top, src_w, top + new_h))
    return img.resize((target_w, target_h), Image.Resampling.LANCZOS)


def load_font(text):
    size = 54 if len(text) <= 32 else 46
    for font_path in (
        r"C:\Windows\Fonts\arialbd.ttf",
        r"C:\Windows\Fonts\segoeuib.ttf",
        r"C:\Windows\Fonts\arial.ttf",
    ):
        try:
            return ImageFont.truetype(font_path, size)
        except Exception:
            pass
    return ImageFont.load_default()


def wrap_text(draw, text, font, max_width):
    words = text.split(" ")
    lines = []
    current = ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        bbox = draw.textbbox((0, 0), candidate, font=font)
        if bbox[2] - bbox[0] <= max_width or not current:
            current = candidate
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def add_label(img, text):
    draw = ImageDraw.Draw(img, "RGBA")
    font = load_font(text)
    target_w, _ = img.size
    margin = 34
    pad_x = 22
    pad_y = 14
    line_gap = 4
    max_label_w = int(target_w * 0.46)
    lines = wrap_text(draw, text, font, max_label_w)

    widths = []
    heights = []
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        widths.append(bbox[2] - bbox[0])
        heights.append(bbox[3] - bbox[1])

    label_w = max(widths) + pad_x * 2
    label_h = sum(heights) + line_gap * (len(lines) - 1) + pad_y * 2
    x0 = margin
    y0 = margin
    draw.rounded_rectangle(
        (x0, y0, x0 + label_w, y0 + label_h),
        radius=22,
        fill=(15, 17, 20, 218),
    )

    y = y0 + pad_y
    for line, line_h in zip(lines, heights):
        bbox = draw.textbbox((0, 0), line, font=font)
        draw.text((x0 + pad_x, y - bbox[1]), line, fill=(255, 255, 255, 255), font=font)
        y += line_h + line_gap
    return img


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--src", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--text", required=True)
    args = parser.parse_args()

    src = Path(args.src)
    out = Path(args.out)
    if not src.exists():
        raise SystemExit(f"source image not found: {src}")

    img = Image.open(src).convert("RGB")
    img = fit_to_card(img, 1672, 941)
    img = add_label(img, args.text)
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, "WEBP", quality=88, method=6)

    check = Image.open(out)
    if check.size != (1672, 941):
        raise SystemExit(f"unexpected output size: {check.size}")
    print(f"saved {out} 1672x941")


if __name__ == "__main__":
    main()
