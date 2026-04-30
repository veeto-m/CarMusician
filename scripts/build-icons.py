#!/usr/bin/env python3
"""Generate the full PWA icon set from public/icon-source.png.

Outputs (overwrites):
  public/icon-192.png            — square, original artwork (PWA "any")
  public/icon-512.png             — square, original artwork (PWA "any")
  public/icon-192-maskable.png    — same artwork shrunk to 80% with the
                                    background extended, so Android's
                                    adaptive-icon mask never clips the clef
                                    or car
  public/icon-512-maskable.png    — same as above, 512 px
  public/apple-touch-icon.png     — 180×180, square (no transparency for iOS)

Run:
  python3 scripts/build-icons.py
or via npm:
  npm run icons
"""
from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("PIL/Pillow not installed. Run: pip install --user pillow")

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'public' / 'icon-source.png'
OUT = ROOT / 'public'

# Maskable safe zone: ~80% of the icon is guaranteed visible after the
# OS applies its mask. Anything outside the inner 80% may be cropped.
SAFE_RATIO = 0.80

# Color used to extend the background on the maskable variant. Pulled from
# the source's top-left pixel so it matches whatever background the artwork
# already uses (black for the current artwork, but flexible).
def background_color(img: Image.Image) -> tuple[int, int, int, int]:
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    return img.getpixel((0, 0))


def resize_square(img: Image.Image, size: int) -> Image.Image:
    return img.convert('RGBA').resize((size, size), Image.LANCZOS)


def make_maskable(src: Image.Image, size: int) -> Image.Image:
    bg = background_color(src)
    canvas = Image.new('RGBA', (size, size), bg)
    inner = int(size * SAFE_RATIO)
    art = src.convert('RGBA').resize((inner, inner), Image.LANCZOS)
    offset = ((size - inner) // 2, (size - inner) // 2)
    canvas.alpha_composite(art, offset)
    return canvas


def make_apple_touch(src: Image.Image) -> Image.Image:
    # iOS doesn't honour transparency; flatten on top of the background
    # color so the corners match the rest of the artwork.
    bg = background_color(src)
    canvas = Image.new('RGBA', (180, 180), bg)
    art = src.convert('RGBA').resize((180, 180), Image.LANCZOS)
    canvas.alpha_composite(art)
    return canvas.convert('RGB')


def main() -> int:
    if not SRC.exists():
        sys.exit(f"Source missing: {SRC}\nDrop the artwork there and rerun.")
    src = Image.open(SRC)
    print(f"source: {src.size} {src.mode}")

    out_192 = OUT / 'icon-192.png'
    out_512 = OUT / 'icon-512.png'
    resize_square(src, 192).save(out_192, optimize=True)
    resize_square(src, 512).save(out_512, optimize=True)
    print(f"wrote {out_192.relative_to(ROOT)}")
    print(f"wrote {out_512.relative_to(ROOT)}")

    out_192m = OUT / 'icon-192-maskable.png'
    out_512m = OUT / 'icon-512-maskable.png'
    make_maskable(src, 192).save(out_192m, optimize=True)
    make_maskable(src, 512).save(out_512m, optimize=True)
    print(f"wrote {out_192m.relative_to(ROOT)}")
    print(f"wrote {out_512m.relative_to(ROOT)}")

    out_apple = OUT / 'apple-touch-icon.png'
    make_apple_touch(src).save(out_apple, optimize=True)
    print(f"wrote {out_apple.relative_to(ROOT)}")

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
