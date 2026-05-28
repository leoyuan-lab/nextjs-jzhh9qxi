#!/usr/bin/env python3
"""
Extract hub carousel poster frames from application master .mov files,
save high-quality JPG + WebP under public/applications/cards/.

Usage (project root):
  .venv/bin/python3 scripts/export_application_hub_cards.py
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MASTERS = ROOT / "public" / "applications" / "masters"
CARDS = ROOT / "public" / "applications" / "cards"

# Keep in sync with data/application-assets.ts → APPLICATION_HUB_CARD_SOURCES
EXPORTS = (
    {"out": "retail-service", "master": "milk-tea.mov", "startSec": 2.8},
    {"out": "manufacturing", "master": "welding.mov", "startSec": 2.5},
    {"out": "medical-lab", "master": "lab-loading.mov", "startSec": 4.0},
    {"out": "education", "master": "hospital-recover.mov", "startSec": 3.2},
)

JPEG_QUALITY = 95
WEBP_QUALITY = 92


def ffmpeg_bin() -> str:
    try:
        import imageio_ffmpeg

        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError as exc:
        raise SystemExit("Install: pip install imageio-ffmpeg") from exc


def probe_size(ffmpeg: str, master: Path) -> tuple[int, int]:
    cmd = [
        ffmpeg,
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        str(master),
        "-f",
        "null",
        "-",
    ]
    # ffmpeg prints stream info to stderr; use ffprobe-like parse via second call
    probe = [
        ffmpeg,
        "-hide_banner",
        "-i",
        str(master),
    ]
    proc = subprocess.run(probe, capture_output=True, text=True)
    text = proc.stderr
    for line in text.splitlines():
        if "Video:" in line and "," in line:
            # e.g. Video: h264 ..., 1920x1080
            parts = line.split(",")
            for part in parts:
                part = part.strip()
                if "x" in part and part.replace("x", "").replace(" ", "").isdigit() is False:
                    token = part.split()[-1]
                    if "x" in token:
                        w, h = token.split("x", 1)
                        if w.isdigit() and h.isdigit():
                            return int(w), int(h)
    return (1920, 1080)


def extract_frame(ffmpeg: str, master: Path, start_sec: float, jpg_out: Path) -> None:
    cmd = [
        ffmpeg,
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-ss",
        f"{start_sec:.3f}",
        "-i",
        str(master),
        "-frames:v",
        "1",
        "-q:v",
        "1",
        "-pix_fmt",
        "yuvj420p",
        str(jpg_out),
    ]
    subprocess.run(cmd, check=True)


def jpg_to_webp(jpg_out: Path, webp_out: Path) -> None:
    from PIL import Image

    im = Image.open(jpg_out)
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGB")
    elif im.mode == "RGBA":
        im = im.convert("RGB")
    im.save(
        webp_out,
        "WEBP",
        quality=WEBP_QUALITY,
        method=6,
        lossless=False,
    )


def main() -> None:
    ffmpeg = ffmpeg_bin()
    CARDS.mkdir(parents=True, exist_ok=True)

    for item in EXPORTS:
        master = MASTERS / item["master"]
        if not master.is_file():
            print(f"SKIP missing master: {master.relative_to(ROOT)}", file=sys.stderr)
            continue

        jpg_out = CARDS / f"{item['out']}.jpg"
        webp_out = CARDS / f"{item['out']}.webp"

        w, h = probe_size(ffmpeg, master)
        extract_frame(ffmpeg, master, item["startSec"], jpg_out)
        jpg_to_webp(jpg_out, webp_out)

        from PIL import Image

        im = Image.open(jpg_out)
        print(
            f"OK {item['out']}: master={item['master']} @ {item['startSec']}s "
            f"→ {im.size[0]}x{im.size[1]} jpg={jpg_out.stat().st_size // 1024}KB "
            f"webp={webp_out.stat().st_size // 1024}KB (probe {w}x{h})"
        )

    print(f"Done — {len(EXPORTS)} card pairs in {CARDS.relative_to(ROOT)}/")


if __name__ == "__main__":
    main()
