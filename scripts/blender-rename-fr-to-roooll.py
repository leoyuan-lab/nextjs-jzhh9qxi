"""
Blender 4.x — batch rename (run in Scripting workspace → Run Script)

Rules:
  FR3-C, FR3C, FR3 (not FR30/FR16…) → r-lite-c
  Any remaining FR                  → roooll
  RD37                              → roooll
  Final names must not contain "fr" (case-insensitive)
"""

import re

import bpy


def rename_fr_branding(text: str) -> str:
    if not text:
        return text

    s = text

    # 1) FR3-C / fr3-c
    s = re.sub(r"FR3-C", "r-lite-c", s, flags=re.IGNORECASE)
    # 2) FR3C / fr3c (before bare FR3)
    s = re.sub(r"FR3C", "r-lite-c", s, flags=re.IGNORECASE)
    # 3) FR3 not followed by a digit (keeps FR30, FR16, … untouched here)
    s = re.sub(r"FR3(?!\d)", "r-lite-c", s, flags=re.IGNORECASE)
    # 4) RD37 → roooll
    s = re.sub(r"RD37", "roooll", s, flags=re.IGNORECASE)
    # 5) Any remaining FR → roooll (FR5 → roooll5, etc.)
    s = re.sub(r"FR", "roooll", s, flags=re.IGNORECASE)

    return s


def has_fr_substring(text: str) -> bool:
    return bool(re.search(r"fr", text, flags=re.IGNORECASE))


def rename_block(block, label: str, renamed: list) -> None:
    old = block.name
    new = rename_fr_branding(old)
    if new != old:
        block.name = new
        renamed.append((label, old, new))


def run() -> None:
    renamed = []

    for obj in bpy.data.objects:
        rename_block(obj, "object", renamed)
        if obj.data and hasattr(obj.data, "name"):
            rename_block(obj.data, "mesh-data", renamed)

    for mesh in bpy.data.meshes:
        rename_block(mesh, "mesh", renamed)

    for mat in bpy.data.materials:
        rename_block(mat, "material", renamed)

    for coll in bpy.data.collections:
        rename_block(coll, "collection", renamed)

    warnings = []
    for pool, label in (
        (bpy.data.objects, "object"),
        (bpy.data.meshes, "mesh"),
        (bpy.data.materials, "material"),
        (bpy.data.collections, "collection"),
    ):
        for block in pool:
            if has_fr_substring(block.name):
                warnings.append(f"  [{label}] still contains 'fr': {block.name}")

    print(f"Renamed {len(renamed)} entries.")
    for label, old, new in renamed[:40]:
        print(f"  [{label}] {old} -> {new}")
    if len(renamed) > 40:
        print(f"  ... and {len(renamed) - 40} more")

    if warnings:
        print("WARN — manual fix needed:")
        for line in warnings:
            print(line)
    else:
        print("OK — no 'fr' left in object/mesh/material/collection names.")


run()
