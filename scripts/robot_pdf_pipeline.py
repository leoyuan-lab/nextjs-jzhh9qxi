#!/usr/bin/env python3
"""
从法奥 / FAIRINO 产品手册 PDF 提取嵌入图，按 mapping 处理为透明底 PNG，
输出到 public/images/robots/{variant_id}.png（与 data/products.ts 中 variant id 一致）。

依赖: pip install pymupdf pillow numpy

1) 把 PDF 放到任意路径，执行:
   python3 scripts/robot_pdf_pipeline.py extract --pdf /path/to/manual.pdf
   → 嵌入图导出到 public/images/robots/_raw/

2) 复制 scripts/robot_image_mapping.template.json 为 scripts/robot_image_mapping.json，
   将每个 id 的值改为 _raw/ 下实际文件名（或 _picked/ 下你手裁的图）。

3) python3 scripts/robot_pdf_pipeline.py process --mapping scripts/robot_image_mapping.json

一键: python3 scripts/robot_pdf_pipeline.py run --pdf manual.pdf --mapping scripts/robot_image_mapping.json

占位图: python3 scripts/robot_pdf_pipeline.py placeholders
"""

from __future__ import annotations

import argparse
import base64
import json
import sys
from pathlib import Path

# 1×1 透明 PNG（无 Pillow 也可写占位）
_PLACEHOLDER_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
)

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "images" / "robots"
RAW_DIR = OUT_DIR / "_raw"

VARIANT_IDS = [
    "fr3-std",
    "fr3-c",
    "fr3-wms",
    "fr3-wml",
    "fr5-std",
    "fr5-c",
    "fr5-wml",
    "fr10-std",
    "fr16-std",
    "fr20-std",
    "fr30-std",
]


def ensure_deps() -> None:
    import fitz  # noqa: F401
    import numpy as np  # noqa: F401
    from PIL import Image  # noqa: F401


def extract_pdf(pdf_path: Path) -> None:
    import fitz

    if not pdf_path.is_file():
        raise SystemExit(f"找不到 PDF: {pdf_path}")

    RAW_DIR.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(pdf_path)
    seen: set[int] = set()
    count = 0
    for page_index in range(len(doc)):
        for img in doc.get_page_images(page_index, full=True):
            xref = img[0]
            if xref in seen:
                continue
            seen.add(xref)
            data = doc.extract_image(xref)
            img_bytes = data["image"]
            ext = (data.get("ext") or "png").lower()
            if ext not in ("png", "jpeg", "jpg", "webp", "jpx"):
                ext = "png"
            name = f"page{page_index + 1:03d}_xref{xref}.{ext}"
            (RAW_DIR / name).write_bytes(img_bytes)
            count += 1
    doc.close()
    print(f"已导出 {count} 个唯一嵌入图到 {RAW_DIR}")


def load_mapping_json(path: Path) -> dict[str, str]:
    if not path.is_file():
        raise SystemExit(f"找不到 mapping: {path}")
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise SystemExit("mapping 须为 JSON object")
    out: dict[str, str] = {}
    for vid in VARIANT_IDS:
        val = data.get(vid)
        if not val or not str(val).strip() or "REPLACE_ME" in str(val):
            raise SystemExit(f"mapping 中 {vid} 未配置有效路径（勿保留 REPLACE_ME）")
        out[vid] = str(val).strip()
    return out


def resolve_source(rel: str) -> Path:
    p = Path(rel)
    if not p.is_absolute():
        cand = OUT_DIR / rel
        p = cand if cand.is_file() else ROOT / rel
    if not p.is_file():
        raise SystemExit(f"源图不存在: {rel}")
    return p


def orange_to_gray_transparent(
    arr_in: "object",
    *,
    white_cutoff: int = 248,
    white_fuzz: int = 20,
    upscale: int = 2,
) -> "object":
    import numpy as np
    from PIL import Image

    arr = np.asarray(arr_in, dtype=np.uint8).copy()
    if arr.ndim != 3 or arr.shape[2] not in (3, 4):
        raise ValueError("需要 RGB 或 RGBA")
    if arr.shape[2] == 3:
        a = np.full(arr.shape[:2], 255, dtype=np.uint8)
        arr = np.dstack([arr, a])
    r = arr[:, :, 0].astype(np.int16)
    g = arr[:, :, 1].astype(np.int16)
    b = arr[:, :, 2].astype(np.int16)

    orange = (
        (r > 110)
        & (g > 55)
        & (r > g - 5)
        & (g > b)
        & (r - b > 35)
        & (r < 254)
    )
    y = (0.299 * r + 0.587 * g + 0.114 * b).clip(0, 255).astype(np.uint8)
    gray_rgb = np.stack([y, y, y], axis=-1)
    arr[:, :, :3] = np.where(orange[:, :, None], gray_rgb, arr[:, :, :3])

    rw = arr[:, :, 0].astype(np.int16)
    gw = arr[:, :, 1].astype(np.int16)
    bw = arr[:, :, 2].astype(np.int16)
    near_white = (
        (rw > white_cutoff - white_fuzz)
        & (gw > white_cutoff - white_fuzz)
        & (bw > white_cutoff - white_fuzz)
    )
    dist_white = np.sqrt((255 - rw) ** 2 + (255 - gw) ** 2 + (255 - bw) ** 2)
    soft = near_white | (dist_white < (white_fuzz * 3))
    arr[:, :, 3] = np.where(soft, 0, arr[:, :, 3])

    if upscale > 1:
        im = Image.fromarray(arr, "RGBA")
        w, h = im.size
        im = im.resize((w * upscale, h * upscale), Image.Resampling.LANCZOS)
        arr = np.array(im)
    return arr


def process_one(src: Path, dst: Path, upscale: int) -> None:
    import numpy as np
    from PIL import Image

    im = Image.open(src).convert("RGBA")
    arr = np.array(im)
    out = orange_to_gray_transparent(arr, upscale=upscale)
    dst.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(out, "RGBA").save(dst, "PNG", optimize=True)
    print(f"OK {dst.relative_to(ROOT)}")


def process_mapping(mapping_path: Path, upscale: int) -> None:
    ensure_deps()
    mapping = load_mapping_json(mapping_path)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for vid, rel in mapping.items():
        src = resolve_source(rel)
        process_one(src, OUT_DIR / f"{vid}.png", upscale)


def run(pdf: Path, mapping_path: Path, upscale: int) -> None:
    ensure_deps()
    extract_pdf(pdf)
    process_mapping(mapping_path, upscale)


def write_placeholder_pngs() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for vid in VARIANT_IDS:
        p = OUT_DIR / f"{vid}.png"
        if p.is_file() and p.stat().st_size > 800:
            continue
        p.write_bytes(_PLACEHOLDER_PNG)
    print(f"占位 PNG: {OUT_DIR}（已存在且 >800B 的文件不会覆盖）")


def main() -> None:
    ap = argparse.ArgumentParser(description="法奥手册 → public/images/robots/*.png")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p1 = sub.add_parser("extract", help="从 PDF 导出嵌入图到 _raw/")
    p1.add_argument("--pdf", type=Path, required=True)

    p2 = sub.add_parser("process", help="按 JSON mapping 处理")
    p2.add_argument("--mapping", type=Path, required=True)
    p2.add_argument("--upscale", type=int, default=2, help="LANCZOS 放大倍数（默认 2）")

    p3 = sub.add_parser("run", help="extract 再 process")
    p3.add_argument("--pdf", type=Path, required=True)
    p3.add_argument("--mapping", type=Path, required=True)
    p3.add_argument("--upscale", type=int, default=2)

    sub.add_parser("placeholders", help="写入 11 个透明占位 PNG")

    args = ap.parse_args()
    if args.cmd == "extract":
        ensure_deps()
        extract_pdf(args.pdf)
    elif args.cmd == "process":
        process_mapping(args.mapping, args.upscale)
    elif args.cmd == "run":
        run(args.pdf, args.mapping, args.upscale)
    elif args.cmd == "placeholders":
        write_placeholder_pngs()


if __name__ == "__main__":
    try:
        main()
    except ImportError:
        print("请先安装: pip install pymupdf pillow numpy", file=sys.stderr)
        sys.exit(1)
