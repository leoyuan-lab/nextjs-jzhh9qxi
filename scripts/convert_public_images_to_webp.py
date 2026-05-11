#!/usr/bin/env python3
"""
将 public/images 下（递归）的 PNG 转为高质量 WebP，删除原 PNG。

用法（项目根目录）:
  .venv/bin/python3 scripts/convert_public_images_to_webp.py

依赖: Pillow（与 robot_pdf_pipeline 相同 venv）
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "public" / "images"


def main() -> None:
    try:
        from PIL import Image
    except ImportError:
        print("请先安装: pip install pillow", file=sys.stderr)
        sys.exit(1)

    if not IMAGES.is_dir():
        print(f"跳过：不存在 {IMAGES}", file=sys.stderr)
        sys.exit(0)

    pngs = sorted(IMAGES.rglob("*.png"))
    if not pngs:
        print("未找到 PNG")
        return

    for src in pngs:
        dst = src.with_suffix(".webp")
        im = Image.open(src)
        if im.mode not in ("RGB", "RGBA"):
            im = im.convert("RGBA")
        im.save(
            dst,
            "WEBP",
            quality=92,
            method=6,
            lossless=False,
        )
        src.unlink()
        print(f"OK {dst.relative_to(ROOT)}")

    print(f"完成：共 {len(pngs)} 个文件")


if __name__ == "__main__":
    main()
