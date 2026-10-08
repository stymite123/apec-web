# Build-time portrait cut-outs for the team cards (no browser-side image processing).
# Usage (needs Python + rembg, MIT; the isnet model (Apache-2.0) downloads on first run):
#   python -m pip install "rembg[cpu]"
#   python scripts/cutout-portraits.py
# Re-run whenever a photo in public/team/*.jpg changes, then `pnpm dither`.
# Output: public/team/cutout/<slug>.png (RGBA, person only).
from pathlib import Path

from PIL import Image
from rembg import new_session, remove

SRC = Path("public/team")
OUT = SRC / "cutout"
OUT.mkdir(exist_ok=True)

session = new_session("isnet-general-use")
for photo in sorted(SRC.glob("*.jpg")):
    image = Image.open(photo).convert("RGB")
    cut = remove(image, session=session, post_process_mask=True)
    out = OUT / f"{photo.stem}.png"
    cut.save(out, optimize=True)
    print(out, cut.size)
