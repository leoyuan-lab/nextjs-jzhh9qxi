#!/usr/bin/env python3
"""
回退版：使用最初稳定的裁切导出逻辑。
- 保留 PDF 原始矢量颜色/样式（不强制黑灰）
- 只剔除 <image> 位图节点
- 维持输出命名：page_{9|10|11}_{i}.svg 与 pag-{9|10|11}-{i}-{i}.svg
"""

from __future__ import annotations

import argparse
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUT_DIR = ROOT / "public" / "images" / "robots" / "_vectors"


def normalize_svg(svg_text: str) -> str:
    root = ET.fromstring(svg_text)
    ns_xlink = "http://www.w3.org/1999/xlink"
    shape_tags = {"path", "rect", "circle", "ellipse", "line", "polyline", "polygon"}
    for parent in list(root.iter()):
        for child in list(parent):
            if child.tag.split("}")[-1] != "image":
                continue
            href = child.attrib.get(f"{{{ns_xlink}}}href") or child.attrib.get("href", "")
            if href:
                parent.remove(child)

    def walk(node: ET.Element, hidden: bool) -> None:
        tag = node.tag.split("}")[-1]
        now_hidden = hidden or tag in {"defs", "clipPath", "mask"}
        if not now_hidden:
            if tag in shape_tags:
                # 透明底：移除所有 shape 填充，仅保留黑色线稿
                node.set("fill", "none")
                node.set("stroke", "#000000")
                sw = node.attrib.get("stroke-width")
                try:
                    swf = float(sw) if sw is not None else 1.0
                except ValueError:
                    swf = 1.0
                node.set("stroke-width", f"{max(0.8, swf):.3f}")
                node.set("opacity", "1")
            elif tag == "text":
                # 文字保留可见
                node.set("fill", "#000000")
                node.set("stroke", "none")
        for child in list(node):
            walk(child, now_hidden)

    walk(root, False)
    return ET.tostring(root, encoding="unicode")


def uniq_rects(rects: list["fitz.Rect"], tol: float = 1.5) -> list["fitz.Rect"]:
    out: list["fitz.Rect"] = []
    for r in rects:
        if any(
            abs(r.x0 - e.x0) <= tol
            and abs(r.y0 - e.y0) <= tol
            and abs(r.x1 - e.x1) <= tol
            and abs(r.y1 - e.y1) <= tol
            for e in out
        ):
            continue
        out.append(r)
    return out


def overlap_x(a: "fitz.Rect", b: "fitz.Rect") -> float:
    return max(0.0, min(a.x1, b.x1) - max(a.x0, b.x0))


def export_clip_svg(doc: "fitz.Document", page_index: int, rect: "fitz.Rect", out_file: Path, scale: float) -> None:
    import fitz

    w = rect.width * scale
    h = rect.height * scale
    tmp = fitz.open()
    p = tmp.new_page(width=w, height=h)
    p.show_pdf_page(fitz.Rect(0, 0, w, h), doc, page_index, clip=rect)
    svg = p.get_svg_image(text_as_path=False)
    tmp.close()
    out_file.write_text(normalize_svg(svg), encoding="utf-8")


def rect_iou(a: "fitz.Rect", b: "fitz.Rect") -> float:
    ix = max(0.0, min(a.x1, b.x1) - max(a.x0, b.x0))
    iy = max(0.0, min(a.y1, b.y1) - max(a.y0, b.y0))
    inter = ix * iy
    if inter <= 0:
        return 0.0
    ua = a.width * a.height + b.width * b.height - inter
    return inter / ua if ua > 0 else 0.0


def visual_score(doc: "fitz.Document", page_index: int, rect: "fitz.Rect") -> float:
    """
    视觉评分（仅用于匹配，不作为最终输出）：
    - 黑像素密度：避免选到空白框
    - 文本量：小图通常带尺寸文字
    """
    import fitz

    # 快速低分辨率渲染
    mat = fitz.Matrix(0.6, 0.6)
    pix = doc[page_index].get_pixmap(matrix=mat, clip=rect, alpha=False)
    data = pix.samples  # RGB bytes
    n = max(1, pix.width * pix.height)
    dark = 0
    # 统计亮度较低像素
    for i in range(0, len(data), 3):
        y = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
        if y < 180:
            dark += 1
    dark_ratio = dark / n

    # 文本块数量（尺寸标注等）
    txt = doc[page_index].get_text("text", clip=rect)
    text_len = len(txt.strip())
    text_score = min(1.0, text_len / 80.0)

    return dark_ratio * 0.75 + text_score * 0.25


def export_target_pages(pdf: Path, out_dir: Path, pages: list[int], scale: float, only_small: bool = False) -> None:
    import fitz

    if not pdf.is_file():
        raise SystemExit(f"PDF 不存在: {pdf}")

    out_dir.mkdir(parents=True, exist_ok=True)
    for p in pages:
        if not only_small:
            for f in out_dir.glob(f"page_{p}_*.svg"):
                f.unlink()
        for f in out_dir.glob(f"pag-{p}-*-*.svg"):
            f.unlink()

    expected_big_map = {9: 4, 10: 3, 11: 4}
    doc = fitz.open(pdf)

    for pno in pages:
        page = doc[pno - 1]
        page_area = page.rect.width * page.rect.height

        big: list[fitz.Rect] = []
        small: list[fitz.Rect] = []
        for d in page.get_drawings():
            r = d.get("rect")
            if not r:
                continue
            a = r.width * r.height
            if a > page_area * 0.8:
                continue
            if r.width >= 240 and r.height >= 240:
                big.append(r)
            elif 40 <= r.width <= 260 and 40 <= r.height <= 260:
                small.append(r)

        all_rects = [d.get("rect") for d in page.get_drawings() if d.get("rect")]

        # 大图候选按“包含图元密度”评分，避免只抓到外框
        scored_big: list[tuple[float, fitz.Rect]] = []
        for r in uniq_rects(big):
            cx_hits = 0
            for rr in all_rects:
                cpx = (rr.x0 + rr.x1) / 2
                cpy = (rr.y0 + rr.y1) / 2
                if r.x0 <= cpx <= r.x1 and r.y0 <= cpy <= r.y1:
                    cx_hits += 1
            score = cx_hits / max(1.0, r.width * r.height) * 1e6
            scored_big.append((score, r))
        scored_big.sort(key=lambda t: t[0], reverse=True)

        selected_big: list[fitz.Rect] = []
        for _score, r in scored_big:
            if any(rect_iou(r, e) > 0.85 for e in selected_big):
                continue
            selected_big.append(r)
            if len(selected_big) >= expected_big_map.get(pno, len(scored_big)):
                break
        big = sorted(selected_big, key=lambda x: (x.y0, x.x0))
        small = sorted(uniq_rects(small), key=lambda x: (x.y0, x.x0))

        if not only_small:
            for i, b in enumerate(big, start=1):
                export_clip_svg(doc, pno - 1, b, out_dir / f"page_{pno}_{i}.svg", scale=scale)

        used_small: set[int] = set()
        for i, b in enumerate(big, start=1):
            # 扩大搜索范围：大图下方空白区域（含图间空隙）
            next_y0 = page.rect.y1
            for nb in big:
                if nb.y0 > b.y0 and nb.y0 < next_y0:
                    next_y0 = nb.y0
            region_top = b.y1 - 20
            region_bottom = max(next_y0 - 8, region_top + 40)
            region_left = max(page.rect.x0, b.x0 - b.width * 0.35)
            region_right = min(page.rect.x1, b.x1 + b.width * 0.35)

            bx = (b.x0 + b.x1) / 2
            cand: list[tuple[float, int, fitz.Rect]] = []
            for j, s in enumerate(small):
                if j in used_small:
                    continue
                sx = (s.x0 + s.x1) / 2
                sy = (s.y0 + s.y1) / 2
                dx = abs(sx - bx)
                dy = s.y0 - b.y1
                ox = overlap_x(s, b)
                in_region = (
                    region_left <= sx <= region_right
                    and region_top <= sy <= region_bottom
                )
                # 右下角优先：中心在大图中心右下 + 靠近右下角；区域内优先
                br_dx = abs(s.x1 - b.x1)
                br_dy = abs(s.y1 - b.y1)
                in_right_bottom = sx >= (b.x0 + b.x1) / 2 and sy >= (b.y0 + b.y1) / 2
                vis = visual_score(doc, pno - 1, s)
                if in_region and in_right_bottom and -30 <= dy <= 420:
                    score = br_dx * 1.2 + br_dy * 1.2 + dx * 0.5 - min(ox, 80) * 0.5 - vis * 220
                elif in_region:
                    score = br_dx * 1.5 + br_dy * 1.5 + dx * 0.9 + abs(dy) * 0.8 - vis * 180
                else:
                    score = abs(dy) * 4.0 + dx * 1.3 + br_dx + br_dy + 500 - vis * 120
                cand.append((score, j, s))
            if not cand:
                continue
            cand.sort(key=lambda t: t[0])
            _, pick_j, pick = cand[0]
            used_small.add(pick_j)
            export_clip_svg(doc, pno - 1, pick, out_dir / f"pag-{pno}-{i}-{i}.svg", scale=scale)

        print(f"[page {pno}] big={len(big)} small_candidates={len(small)}")

    doc.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="回退版：导出 9/10/11 页大图与对应小图")
    parser.add_argument("--pdf", type=Path, required=True, help="PDF 路径")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT_DIR, help=f"输出目录（默认: {DEFAULT_OUT_DIR}）")
    parser.add_argument("--pages", type=str, default="9,10,11", help="逗号分隔页码")
    parser.add_argument("--scale", type=float, default=3.0, help="导出缩放倍数（默认 3.0）")
    parser.add_argument("--only-small", action="store_true", help="仅重生成 pag-* 小图，不动 page_* 大图")
    args = parser.parse_args()

    pages = [int(x.strip()) for x in args.pages.split(",") if x.strip()]
    export_target_pages(args.pdf, args.out, pages, args.scale, only_small=args.only_small)


if __name__ == "__main__":
    try:
        main()
    except ImportError:
        print("请先安装依赖: pip install pymupdf", file=sys.stderr)
        sys.exit(1)
