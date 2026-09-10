"""
Featured image voor cryptocourant.com — 1200x600 webp, blauw palet.

Huisstijl: diepblauwe achtergrond met lichtblauwe gloed, subtiel raster,
een grafiekmotief dat bij het artikel past, een muntschijf met de ticker
en een korte kop. Alles op 2x gerenderd en teruggeschaald, zodat randen
en tekst glad blijven.
"""

import math
from PIL import Image, ImageDraw, ImageFilter, ImageFont

S = 2  # supersampling
W, H = 1200 * S, 600 * S

import os

HERE = os.path.dirname(os.path.abspath(__file__))


def find_font(*names):
    """Zoekt eerst in fonts/ naast dit script, daarna in de systeemmappen."""
    roots = [os.path.join(HERE, "fonts"), "/usr/share/fonts/truetype/google-fonts",
             "/usr/share/fonts/truetype/liberation", "/Library/Fonts",
             os.path.expanduser("~/Library/Fonts")]
    for name in names:
        for root in roots:
            path = os.path.join(root, name)
            if os.path.exists(path):
                return path
    raise FileNotFoundError(names[0])


BOLD = find_font("Poppins-Bold.ttf", "LiberationSans-Bold.ttf")
MED = find_font("Poppins-Medium.ttf", "LiberationSans-Regular.ttf")
REG = find_font("Poppins-Regular.ttf", "LiberationSans-Regular.ttf")
SERIF = find_font("InstrumentSerif.ttf", "LiberationSerif-Regular.ttf")

# Palet: van diep marine tot lichtblauw
NAVY_TOP = (7, 20, 48)
NAVY_BOT = (12, 39, 88)
GLOW = (56, 160, 255)
ICE = (150, 210, 255)
LIGHT = (125, 200, 255)
WHITE = (255, 255, 255)
BRAND = (143, 157, 255)  # --accent in de donkere stand


def font(path, size):
    return ImageFont.truetype(path, size * S)


def background():
    img = Image.new("RGB", (W, H), NAVY_TOP)
    d = ImageDraw.Draw(img)
    # Diagonale verloop van linksboven naar rechtsonder
    for y in range(H):
        t = y / (H - 1)
        c = tuple(round(NAVY_TOP[i] + (NAVY_BOT[i] - NAVY_TOP[i]) * (t**0.85)) for i in range(3))
        d.line([(0, y), (W, y)], fill=c)

    # Zachte gloed rechtsboven
    glow = Image.new("L", (W, H), 0)
    ImageDraw.Draw(glow).ellipse(
        [W * 0.42, -H * 0.55, W * 1.25, H * 0.95], fill=150
    )
    glow = glow.filter(ImageFilter.GaussianBlur(110 * S))
    img = Image.composite(Image.new("RGB", (W, H), GLOW), img, glow.point(lambda v: v // 2))

    # Tweede, kleinere gloed linksonder voor diepte
    g2 = Image.new("L", (W, H), 0)
    ImageDraw.Draw(g2).ellipse([-W * 0.2, H * 0.45, W * 0.45, H * 1.4], fill=90)
    g2 = g2.filter(ImageFilter.GaussianBlur(120 * S))
    img = Image.composite(Image.new("RGB", (W, H), (18, 70, 150)), img, g2.point(lambda v: v // 2))

    # Subtiel raster
    grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grid)
    step = 60 * S
    for x in range(0, W, step):
        gd.line([(x, 0), (x, H)], fill=(255, 255, 255, 10), width=max(1, S // 2))
    for y in range(0, H, step):
        gd.line([(0, y), (W, y)], fill=(255, 255, 255, 10), width=max(1, S // 2))
    img = Image.alpha_composite(img.convert("RGBA"), grid)
    return img


def glow_line(img, points, color, width, blur=14, alpha=255):
    """Lijn met halo eronder, zodat hij oplicht tegen het donkere blauw."""
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).line(points, fill=color + (alpha,), width=width * 3, joint="curve")
    layer = layer.filter(ImageFilter.GaussianBlur(blur * S))
    img.alpha_composite(layer)
    crisp = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(crisp).line(points, fill=color + (alpha,), width=width, joint="curve")
    img.alpha_composite(crisp)


def smooth(points, steps=14):
    """Catmull-Rom door de punten, voor een vloeiende koerslijn."""
    pts = [points[0]] + list(points) + [points[-1]]
    out = []
    for i in range(len(pts) - 3):
        p0, p1, p2, p3 = pts[i : i + 4]
        for s in range(steps):
            t = s / steps
            t2, t3 = t * t, t * t * t
            x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t
                       + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2
                       + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t
                       + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2
                       + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            out.append((x, y))
    out.append(points[-1])
    return out


def coin(img, cx, cy, r, ticker):
    """Muntschijf met ticker, lichtblauw met een zilveren rand."""
    size = int(r * 2.9)
    disc = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    dd = ImageDraw.Draw(disc)
    c = size // 2

    # Halo
    halo = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(halo).ellipse([c - r * 1.12, c - r * 1.12, c + r * 1.12, c + r * 1.12],
                                fill=GLOW + (120,))
    halo = halo.filter(ImageFilter.GaussianBlur(26 * S))
    disc.alpha_composite(halo)

    # Schijf met verticaal verloop
    for i in range(int(r * 2)):
        t = i / (r * 2)
        col = tuple(round(ICE[j] + ((30, 92, 180)[j] - ICE[j]) * (t**0.9)) for j in range(3))
        half = math.sqrt(max(r * r - (i - r) ** 2, 0))
        dd.line([(c - half, c - r + i), (c + half, c - r + i)], fill=col + (255,))

    dd.ellipse([c - r, c - r, c + r, c + r], outline=(226, 242, 255, 235), width=int(4 * S))
    dd.ellipse([c - r * 0.86, c - r * 0.86, c + r * 0.86, c + r * 0.86],
               outline=(255, 255, 255, 90), width=int(2 * S))

    f = font(BOLD, int(r / S * 0.52))
    tb = dd.textbbox((0, 0), ticker, font=f)
    dd.text((c - (tb[2] - tb[0]) / 2 - tb[0], c - (tb[3] - tb[1]) / 2 - tb[1]),
            ticker, font=f, fill=(8, 28, 66, 255))

    img.alpha_composite(disc, (int(cx - c), int(cy - c)))


def motif_golden_cross(img, box):
    """Twee gemiddelden die elkaar kruisen, met de kruising gemarkeerd."""
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    slow = smooth([(x0 + w * i / 6, y0 + h * v) for i, v in
                   enumerate([0.30, 0.40, 0.52, 0.62, 0.68, 0.72, 0.74])])
    fast = smooth([(x0 + w * i / 6, y0 + h * v) for i, v in
                   enumerate([0.88, 0.86, 0.80, 0.66, 0.44, 0.26, 0.12])])
    glow_line(img, slow, (86, 132, 200), int(4 * S), blur=10, alpha=200)
    glow_line(img, fast, LIGHT, int(6 * S), blur=16)

    # Kruispunt: waar de snelle lijn de trage passeert
    cx, cy = fast[len(fast) // 2]
    for a, b in zip(fast, slow):
        if a[1] <= b[1]:
            cx, cy = a
            break
    ring = Image.new("RGBA", img.size, (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring)
    rd.ellipse([cx - 26 * S, cy - 26 * S, cx + 26 * S, cy + 26 * S], fill=(255, 255, 255, 60))
    ring = ring.filter(ImageFilter.GaussianBlur(12 * S))
    img.alpha_composite(ring)
    d = ImageDraw.Draw(img)
    d.ellipse([cx - 11 * S, cy - 11 * S, cx + 11 * S, cy + 11 * S], fill=WHITE + (255,))


def motif_support(img, box, label):
    """Koerslijn die terugvalt op een steunzone met een gestippelde grens."""
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    band_top, band_bot = y0 + h * 0.62, y0 + h * 0.80

    band = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(band).rectangle([x0, band_top, x1, band_bot], fill=(90, 170, 255, 46))
    img.alpha_composite(band)

    d = ImageDraw.Draw(img)
    for x in range(int(x0), int(x1), int(22 * S)):
        d.line([(x, band_bot), (x + 12 * S, band_bot)], fill=ICE + (200,), width=int(3 * S))

    line = smooth([(x0 + w * i / 7, y0 + h * v) for i, v in
                   enumerate([0.22, 0.14, 0.34, 0.26, 0.48, 0.40, 0.62, 0.70])])
    glow_line(img, line, LIGHT, int(6 * S), blur=16)

    px, py = line[-1]
    d.ellipse([px - 11 * S, py - 11 * S, px + 11 * S, py + 11 * S], fill=WHITE + (255,))

    if not label:
        return

    f = font(MED, 20)
    tb = d.textbbox((0, 0), label, font=f)
    tw, th = tb[2] - tb[0], tb[3] - tb[1]
    bx, by = x1 - tw - 22 * S, band_bot + 12 * S
    d.rounded_rectangle([bx - 14 * S, by - 8 * S, bx + tw + 14 * S, by + th + 14 * S],
                        radius=8 * S, fill=(10, 30, 70, 210), outline=(120, 190, 255, 140),
                        width=max(1, S))
    d.text((bx - tb[0], by - tb[1] + 3 * S), label, font=f, fill=ICE + (255,))


def motif_trend(img, box, direction="up"):
    """Standaardmotief: een koerslijn met vlak eronder, op of neer."""
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    shape = ([0.78, 0.66, 0.72, 0.52, 0.56, 0.34, 0.22]
             if direction == "up" else
             [0.20, 0.32, 0.26, 0.46, 0.42, 0.62, 0.74])
    line = smooth([(x0 + w * i / 6, y0 + h * v) for i, v in enumerate(shape)])

    area = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(area).polygon(list(line) + [(x1, y1), (x0, y1)], fill=(90, 170, 255, 40))
    img.alpha_composite(area)

    glow_line(img, line, LIGHT, int(6 * S), blur=16)
    px, py = line[-1]
    ImageDraw.Draw(img).ellipse([px - 11 * S, py - 11 * S, px + 11 * S, py + 11 * S],
                                fill=WHITE + (255,))


def wordmark(img, margin=38, size=30):
    """
    Het CryptoCourant-logo rechtsonder. Wordt pas na het terugschalen
    getekend, op ware grootte, zodat de letters haarscherp blijven.
    """
    d = ImageDraw.Draw(img)
    f = ImageFont.truetype(SERIF, size)
    left, right = "Crypto", "Courant"
    gap = size * 0.18

    lb = d.textbbox((0, 0), left, font=f)
    rb = d.textbbox((0, 0), right, font=f)
    total = (lb[2] - lb[0]) + gap + (rb[2] - rb[0])
    x = img.width - margin - total
    y = img.height - margin - (lb[3] - lb[1])

    d.text((x - lb[0], y - lb[1]), left, font=f, fill=WHITE)
    d.text((x - lb[0] + (lb[2] - lb[0]) + gap - rb[0], y - rb[1]), right, font=f, fill=BRAND)


def compose(out, ticker, motif, kicker=None, headline=None, sub=None):
    """
    Standaard zonder kop en kicker: alleen het beeld, zoals de promptspec
    voorschrijft. Tekst hoort op de pagina, niet in de afbeelding — die wordt
    bijgesneden in kaarten en op social, en dan valt de tekst er half af.
    """
    img = background()

    with_text = bool(headline)
    motif(img, (W * (0.40 if with_text else 0.37), H * 0.16, W * 0.94, H * 0.84))

    if with_text:
        veil = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        vd = ImageDraw.Draw(veil)
        for x in range(int(W * 0.78)):
            a = int(185 * (1 - x / (W * 0.78)) ** 1.4)
            vd.line([(x, 0), (x, H)], fill=(6, 16, 40, a))
        img.alpha_composite(veil)

    coin(img, W * (0.155 if with_text else 0.195), H * 0.50,
         int((112 if with_text else 132) * S), ticker)

    if with_text:
        d = ImageDraw.Draw(img)
        x = W * 0.295
        fk = font(BOLD, 21)
        d.text((x, H * 0.235), kicker.upper(), font=fk, fill=(126, 196, 255, 255))
        kb = d.textbbox((x, H * 0.235), kicker.upper(), font=fk)
        d.line([(x, kb[3] + 14 * S), (x + 54 * S, kb[3] + 14 * S)],
               fill=(126, 196, 255, 255), width=int(4 * S))

        fh = font(BOLD, 52)
        y = H * 0.345
        for line in headline:
            shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
            ImageDraw.Draw(shadow).text((x, y), line, font=fh, fill=(4, 12, 32, 190))
            shadow = shadow.filter(ImageFilter.GaussianBlur(7 * S))
            img.alpha_composite(shadow)
            d.text((x, y), line, font=fh, fill=WHITE + (255,))
            y += 64 * S

        if sub:
            fs = font(REG, 23)
            d.text((x, y + 12 * S), sub, font=fs, fill=(186, 214, 245, 255))

    final = img.convert("RGB").resize((1200, 600), Image.LANCZOS)
    wordmark(final)

    import os
    for q in (94, 90, 86, 82, 78, 72):
        final.save(out, "WEBP", quality=q, method=6)
        if os.path.getsize(out) <= 200_000:
            return q, os.path.getsize(out)
    return q, os.path.getsize(out)


MOTIFS = {
    "cross": lambda label: motif_golden_cross,
    "support": lambda label: (lambda im, box: motif_support(im, box, label)),
    "up": lambda label: (lambda im, box: motif_trend(im, box, "up")),
    "down": lambda label: (lambda im, box: motif_trend(im, box, "down")),
}

if __name__ == "__main__":
    import argparse

    ap = argparse.ArgumentParser(description="Featured image voor cryptocourant.com")
    ap.add_argument("--out", required=True, help="pad naar het .webp-bestand")
    ap.add_argument("--ticker", required=True, help="ticker in de munt, bv. BTC")
    ap.add_argument("--kicker", help="klein label erboven; alleen samen met --headline")
    ap.add_argument("--headline", nargs="+",
                    help="1 of 2 regels tekst in het beeld. Standaard geen tekst.")
    ap.add_argument("--sub", help="regel onder de kop")
    ap.add_argument("--motif", default="up", choices=sorted(MOTIFS), help="grafiekmotief")
    ap.add_argument("--label", help="tekst in het kaartje bij motief 'support'")
    a = ap.parse_args()

    quality, size = compose(a.out, a.ticker, MOTIFS[a.motif](a.label),
                            kicker=a.kicker,
                            headline=a.headline[:2] if a.headline else None,
                            sub=a.sub)
    print(f"{a.out}: 1200x600 webp, {size / 1000:.0f} kB (kwaliteit {quality})")
