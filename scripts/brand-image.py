"""
Merkt een aangeleverd beeld als featured image van Crypto Courant.

Neemt een willekeurige afbeelding (bijvoorbeeld uit een beeldmodel), snijdt
hem bij naar 2:1, schaalt naar 1200x600, zet het logo rechtsonder en slaat
op als webp onder 200 kB. Het logo wordt op ware grootte getekend, dus na
het schalen — daardoor blijft het haarscherp.

    python3 scripts/brand-image.py --in ruw.png --out featured-images/btc.webp
"""

import argparse
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))

WIDTH, HEIGHT = 1200, 600
MAX_BYTES = 200_000

WHITE = (255, 255, 255)
BRAND = (143, 157, 255)  # --accent in de donkere stand van de site


def serif_font(size):
    for root in (os.path.join(HERE, "fonts"), "/usr/share/fonts/truetype/liberation",
                 "/Library/Fonts", os.path.expanduser("~/Library/Fonts")):
        for name in ("InstrumentSerif.ttf", "LiberationSerif-Regular.ttf", "Georgia.ttf"):
            path = os.path.join(root, name)
            if os.path.exists(path):
                return ImageFont.truetype(path, size)
    raise FileNotFoundError("Geen serif-font gevonden voor het logo")


def cover(img, width=WIDTH, height=HEIGHT):
    """Vult het kader zonder vervorming; snijdt de overhang weg."""
    img = img.convert("RGB")
    scale = max(width / img.width, height / img.height)
    resized = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    # Iets boven het midden uitsnijden: daar zit meestal het onderwerp.
    left = (resized.width - width) // 2
    top = max(0, int((resized.height - height) * 0.42))
    return resized.crop((left, top, left + width, top + height))


def scrim(img, w=340, h=120, strength=150):
    """Zachte donkere hoek rechtsonder, zodat het logo altijd leesbaar is."""
    layer = Image.new("L", img.size, 0)
    ImageDraw.Draw(layer).ellipse(
        [img.width - w, img.height - h, img.width + w // 2, img.height + h // 2],
        fill=strength,
    )
    layer = layer.filter(ImageFilter.GaussianBlur(50))
    return Image.composite(Image.new("RGB", img.size, (6, 16, 40)), img, layer)


def wordmark(img, margin=38, size=30):
    """Het Crypto Courant-logo rechtsonder, in het serif-font van de site."""
    d = ImageDraw.Draw(img)
    f = serif_font(size)
    left, right = "Crypto", "Courant"
    gap = size * 0.18

    lb = d.textbbox((0, 0), left, font=f)
    rb = d.textbbox((0, 0), right, font=f)
    total = (lb[2] - lb[0]) + gap + (rb[2] - rb[0])
    x = img.width - margin - total
    y = img.height - margin - (lb[3] - lb[1])

    d.text((x - lb[0], y - lb[1]), left, font=f, fill=WHITE)
    d.text((x - lb[0] + (lb[2] - lb[0]) + gap - rb[0], y - rb[1]), right, font=f, fill=BRAND)


def save_under_limit(img, out, limit=MAX_BYTES):
    """Zo hoog mogelijke kwaliteit die nog onder de limiet past."""
    for quality in (92, 88, 84, 80, 76, 72, 68):
        img.save(out, "WEBP", quality=quality, method=6)
        size = os.path.getsize(out)
        if size <= limit:
            return quality, size
    return quality, os.path.getsize(out)


def main():
    ap = argparse.ArgumentParser(description="Featured image merken voor Crypto Courant")
    ap.add_argument("--in", dest="src", required=True, help="bronafbeelding")
    ap.add_argument("--out", required=True, help="doel, een .webp-bestand")
    ap.add_argument("--no-scrim", action="store_true", help="geen donkere hoek rechtsonder")
    ap.add_argument("--logo-size", type=int, default=30, help="hoogte van het logo in pixels")
    a = ap.parse_args()

    img = cover(Image.open(a.src))
    if not a.no_scrim:
        img = scrim(img)
    wordmark(img, size=a.logo_size)

    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    quality, size = save_under_limit(img, a.out)
    print(f"{a.out}: {WIDTH}x{HEIGHT} webp, {size / 1000:.0f} kB (kwaliteit {quality})")
    if size > MAX_BYTES:
        raise SystemExit("Let op: het bestand blijft boven 200 kB, kies een rustiger bron.")


if __name__ == "__main__":
    main()
