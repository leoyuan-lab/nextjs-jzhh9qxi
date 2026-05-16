#!/usr/bin/env python3
"""
Map high-res PNG sources to public/images/robots/*-hd.webp (same basenames as
data/products.ts `robotVariantWebpHdFilename`).

Priority:
  1. Exact filenames under public/images/robots/ (your Finder exports, ~2MB PNG).
  2. Cursor chat assets (~/.cursor/.../assets) by prefix, if local PNG missing.

Env:
  ROBOT_HD_ASSETS_DIR — override Cursor assets dir for fallback.
"""
from __future__ import annotations

import os
from pathlib import Path

from PIL import Image

# Local exports in public/images/robots/ (Chinese filenames from Finder).
# Value: variant id -> exact PNG basename in the same folder as output.
LOCAL_PNG: dict[str, str] = {
    "fr3-std": "fr3白背景.png",
    "fr3-c": "fr3-c无橙色.png",
    "fr3-wms": "fr3-wms无橙色白背景.png",
    "fr3-wml": "fr3-wml白背景.png",
    "fr5-std": "fr5白背景.png",
    "fr5-c": "fr5-c白背景.png",
    "fr5-wml": "fr5-wml白背景.png",
    "fr10-std": "fr10白背景.png",
    "fr16-std": "fr16白背景.png",
    "fr20-std": "fr20白背景.png",
    "fr30-std": "fr30白背景.png",
}

# Cursor chat assets (PNG). Prefix -> variant id (fallback only).
CURSOR_PREFIX: list[tuple[str, str]] = [
    ("fr5___", "fr5-std"),
    ("fr5-c___", "fr5-c"),
    ("fr16___", "fr16-std"),
    ("fr3-c___", "fr3-c"),
    ("fr3___", "fr3-std"),
    ("fr3-wml___", "fr3-wml"),
    ("fr3-wms______", "fr3-wms"),
    ("fr5-wml___", "fr5-wml"),
    ("fr10___", "fr10-std"),
    ("fr30___", "fr30-std"),
    ("fr20___", "fr20-std"),
]

VARIANT_TO_BASENAME: dict[str, str] = {
    "fr3-std": "r-lite-cobot-fr3-std-hd.webp",
    "fr3-c": "r-lite-cobot-fr3-c-hd.webp",
    "fr3-wms": "r-lite-cobot-fr3-wms-hd.webp",
    "fr3-wml": "r-lite-cobot-fr3-wml-hd.webp",
    "fr5-std": "r-core-cobot-fr5-std-hd.webp",
    "fr5-c": "r-core-cobot-fr5-c-hd.webp",
    "fr5-wml": "r-core-cobot-fr5-wml-hd.webp",
    "fr10-std": "r-reach-cobot-fr10-std-hd.webp",
    "fr16-std": "r-max-cobot-fr16-std-hd.webp",
    "fr20-std": "r-max-cobot-fr20-std-hd.webp",
    "fr30-std": "r-ultra-cobot-fr30-std-hd.webp",
}


def pick_cursor_png(assets_dir: Path, prefix: str) -> Path:
    matches = sorted(assets_dir.glob(f"{prefix}*.png"), key=lambda p: p.stat().st_mtime, reverse=True)
    if not matches:
        raise FileNotFoundError(f"No PNG for prefix {prefix!r} under {assets_dir}")
    return matches[0]


def resolve_src(out_dir: Path, assets_dir: Path, variant_id: str) -> Path:
    local_name = LOCAL_PNG.get(variant_id)
    if local_name:
        p = out_dir / local_name
        if p.is_file():
            return p
    for prefix, vid in CURSOR_PREFIX:
        if vid == variant_id:
            if assets_dir.is_dir():
                return pick_cursor_png(assets_dir, prefix)
            break
    raise FileNotFoundError(f"No source PNG for variant {variant_id!r} (local: {local_name})")


def to_webp_hd(src: Path, dest: Path, quality: int = 95) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    im = Image.open(src)
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGBA" if "A" in im.getbands() else "RGB")
    save_kw: dict = {"format": "WEBP", "quality": quality, "method": 6}
    if im.mode == "RGBA":
        im.save(dest, **save_kw)
    else:
        im.convert("RGB").save(dest, **save_kw)


def main() -> None:
    repo = Path(__file__).resolve().parents[1]
    out_dir = repo / "public" / "images" / "robots"
    assets_dir = Path(
        os.environ.get(
            "ROBOT_HD_ASSETS_DIR",
            str(Path.home() / ".cursor/projects/Users-yuanli-Desktop-nextjs-jzhh9qxi/assets"),
        )
    )

    for variant_id, out_name in VARIANT_TO_BASENAME.items():
        src = resolve_src(out_dir, assets_dir, variant_id)
        dest = out_dir / out_name
        to_webp_hd(src, dest)
        src_kb = src.stat().st_size // 1024
        dst_kb = dest.stat().st_size // 1024
        print(f"{src.name} ({src_kb} KB) -> {dest.relative_to(repo)} ({dst_kb} KB)")


if __name__ == "__main__":
    main()
