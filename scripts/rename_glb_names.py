#!/usr/bin/env python3
"""
Rename glTF `name` fields inside a .glb without changing geometry, materials, or scale.

Only the JSON chunk is edited; the BIN chunk is copied verbatim.

Example:
  python3 scripts/rename_glb_names.py \\
    --input public/models/r-lite-cobot-fr3-c.glb \\
    --output public/models/r-lite-cobot-fr3-c.glb \\
    --replace FR3C rLite

  # Preview only:
  python3 scripts/rename_glb_names.py --input model.glb --dry-run --replace FR3C rLite
"""

from __future__ import annotations

import argparse
import json
import re
import struct
import sys
from pathlib import Path
from typing import Any

NAME_KEYS = ("scenes", "nodes", "meshes", "materials", "images", "textures", "animations", "skins", "cameras")


def load_glb(path: Path) -> tuple[bytes, dict[str, Any], bytes]:
    data = path.read_bytes()
    if data[:4] != b"glTF":
        raise ValueError(f"{path}: not a GLB file")
    _version, length = struct.unpack_from("<II", data, 4)
    if length != len(data):
        raise ValueError(f"{path}: length mismatch ({length} vs {len(data)})")

    offset = 12
    json_doc: dict[str, Any] | None = None
    bin_chunk = b""
    while offset < length:
        chunk_len, chunk_type = struct.unpack_from("<I4s", data, offset)
        offset += 8
        chunk_data = data[offset : offset + chunk_len]
        offset += chunk_len
        if chunk_type == b"JSON":
            json_doc = json.loads(chunk_data)
        elif chunk_type == b"BIN\x00":
            bin_chunk = chunk_data

    if json_doc is None:
        raise ValueError(f"{path}: missing JSON chunk")
    return data, json_doc, bin_chunk


def write_glb(path: Path, json_doc: dict[str, Any], bin_chunk: bytes) -> None:
    json_bytes = json.dumps(json_doc, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    json_bytes += b" " * ((4 - (len(json_bytes) % 4)) % 4)

    total_len = 12 + 8 + len(json_bytes) + (8 + len(bin_chunk) if bin_chunk else 0)
    out = bytearray()
    out += b"glTF"
    out += struct.pack("<II", 2, total_len)
    out += struct.pack("<I4s", len(json_bytes), b"JSON")
    out += json_bytes
    if bin_chunk:
        bin_pad = b"\x00" * ((4 - (len(bin_chunk) % 4)) % 4)
        bin_padded = bin_chunk + bin_pad
        out += struct.pack("<I4s", len(bin_padded), b"BIN\x00")
        out += bin_padded
    path.write_bytes(out)


def rename_names(
    json_doc: dict[str, Any],
    replacements: list[tuple[re.Pattern[str], str]],
) -> list[tuple[str, str, str]]:
    changes: list[tuple[str, str, str]] = []

    def apply(name: str) -> str:
        out = name
        for pattern, repl in replacements:
            out = pattern.sub(repl, out)
        return out

    for key in NAME_KEYS:
        for i, item in enumerate(json_doc.get(key, [])):
            if not isinstance(item, dict):
                continue
            old = item.get("name")
            if not isinstance(old, str) or not old:
                continue
            new = apply(old)
            if new != old:
                item["name"] = new
                changes.append((key, f"{key}[{i}]", f"{old} -> {new}"))

    return changes


def parse_replace(raw: str) -> tuple[str, str]:
    if ":" not in raw:
        raise argparse.ArgumentTypeError(
            f"replace must be FROM:TO or FROM/TO (got {raw!r})",
        )
    sep = ":" if ":" in raw else "/"
    left, right = raw.split(sep, 1)
    if not left:
        raise argparse.ArgumentTypeError("replace FROM must be non-empty")
    return left, right


def main() -> int:
    parser = argparse.ArgumentParser(description="Rename glTF names inside a GLB (JSON only).")
    parser.add_argument("--input", "-i", type=Path, required=True, help="Source .glb")
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        help="Output .glb (default: overwrite --input)",
    )
    parser.add_argument(
        "--replace",
        "-r",
        action="append",
        type=parse_replace,
        required=True,
        metavar="FROM:TO",
        help="Substring replace on names (repeatable), e.g. FR3C:rLite",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print renames only; do not write a file",
    )
    parser.add_argument(
        "--backup",
        action="store_true",
        help="When overwriting input, write input.bak next to it first",
    )
    args = parser.parse_args()

    output = args.output or args.input
    patterns = [(re.compile(re.escape(a), re.IGNORECASE), b) for a, b in args.replace]

    _raw, json_doc, bin_chunk = load_glb(args.input)
    json_copy = json.loads(json.dumps(json_doc))
    changes = rename_names(json_copy, patterns)

    if not changes:
        print("No names matched; nothing to do.")
        return 0

    print(f"Matched {len(changes)} name(s):")
    for _key, label, detail in changes:
        print(f"  {label}: {detail}")

    if args.dry_run:
        print("(dry-run; file not written)")
        return 0

    if args.backup and output == args.input:
        bak = args.input.with_suffix(args.input.suffix + ".bak")
        bak.write_bytes(args.input.read_bytes())
        print(f"Backup: {bak}")

    write_glb(output, json_copy, bin_chunk)
    print(f"Wrote: {output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
