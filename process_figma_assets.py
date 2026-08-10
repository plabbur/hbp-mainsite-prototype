"""Remove Figma frame background fills from exported PNG layers.

The source PNGs in assets/ are direct exports from the supplied Figma file.
Figma bakes each frame's solid background into nested frame exports, so this
small, dependency-free utility keys only that exact background color back to
transparency. It keeps the original source exports alongside the derived files.
"""

from __future__ import annotations

import binascii
import struct
import zlib
from pathlib import Path


PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
ASSET_DIR = Path(__file__).parent / "assets"


def _read_chunks(data: bytes) -> list[tuple[bytes, bytes]]:
    if not data.startswith(PNG_SIGNATURE):
        raise ValueError("Not a PNG file")

    chunks: list[tuple[bytes, bytes]] = []
    offset = len(PNG_SIGNATURE)
    while offset < len(data):
        length = struct.unpack(">I", data[offset : offset + 4])[0]
        kind = data[offset + 4 : offset + 8]
        payload = data[offset + 8 : offset + 8 + length]
        chunks.append((kind, payload))
        offset += 12 + length
        if kind == b"IEND":
            break
    return chunks


def _paeth(left: int, up: int, upper_left: int) -> int:
    estimate = left + up - upper_left
    left_distance = abs(estimate - left)
    up_distance = abs(estimate - up)
    upper_left_distance = abs(estimate - upper_left)
    if left_distance <= up_distance and left_distance <= upper_left_distance:
        return left
    if up_distance <= upper_left_distance:
        return up
    return upper_left


def decode_rgba(path: Path) -> tuple[int, int, list[bytearray]]:
    chunks = _read_chunks(path.read_bytes())
    header = next(payload for kind, payload in chunks if kind == b"IHDR")
    width, height, depth, color_type, compression, filtering, interlace = (
        struct.unpack(">IIBBBBB", header)
    )
    if (depth, color_type, compression, filtering, interlace) != (8, 6, 0, 0, 0):
        raise ValueError(f"{path.name} is not an 8-bit, non-interlaced RGBA PNG")

    compressed = b"".join(payload for kind, payload in chunks if kind == b"IDAT")
    raw = zlib.decompress(compressed)
    bytes_per_pixel = 4
    stride = width * bytes_per_pixel
    rows: list[bytearray] = []
    previous = bytearray(stride)
    offset = 0

    for _ in range(height):
        filter_type = raw[offset]
        offset += 1
        current = bytearray(raw[offset : offset + stride])
        offset += stride

        for index in range(stride):
            left = current[index - bytes_per_pixel] if index >= bytes_per_pixel else 0
            up = previous[index]
            upper_left = (
                previous[index - bytes_per_pixel]
                if index >= bytes_per_pixel
                else 0
            )

            if filter_type == 1:
                current[index] = (current[index] + left) & 0xFF
            elif filter_type == 2:
                current[index] = (current[index] + up) & 0xFF
            elif filter_type == 3:
                current[index] = (current[index] + ((left + up) // 2)) & 0xFF
            elif filter_type == 4:
                current[index] = (
                    current[index] + _paeth(left, up, upper_left)
                ) & 0xFF
            elif filter_type != 0:
                raise ValueError(f"Unsupported PNG filter {filter_type}")

        rows.append(current)
        previous = current

    return width, height, rows


def _chunk(kind: bytes, payload: bytes) -> bytes:
    checksum = binascii.crc32(kind)
    checksum = binascii.crc32(payload, checksum) & 0xFFFFFFFF
    return struct.pack(">I", len(payload)) + kind + payload + struct.pack(">I", checksum)


def encode_rgba(path: Path, width: int, height: int, rows: list[bytearray]) -> None:
    header = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    raw = b"".join(b"\x00" + bytes(row) for row in rows)
    path.write_bytes(
        PNG_SIGNATURE
        + _chunk(b"IHDR", header)
        + _chunk(b"IDAT", zlib.compress(raw, 9))
        + _chunk(b"IEND", b"")
    )


def key_background(source_name: str, output_name: str) -> None:
    source = ASSET_DIR / source_name
    output = ASSET_DIR / output_name
    width, height, rows = decode_rgba(source)
    background = tuple(rows[0][0:3])

    for row in rows:
        for index in range(0, len(row), 4):
            distance = max(
                abs(row[index + channel] - background[channel])
                for channel in range(3)
            )
            if distance <= 1:
                row[index + 3] = 0
            elif distance <= 5:
                row[index + 3] = round(row[index + 3] * (distance - 1) / 4)

    encode_rgba(output, width, height, rows)
    print(f"{source_name} -> {output_name} (keyed rgb{background})")


if __name__ == "__main__":
    for source_name, output_name in (
        ("star-field.png", "star-field-alpha.png"),
        ("skyline-day.png", "skyline-day-alpha.png"),
        ("skyline-twilight.png", "skyline-twilight-alpha.png"),
        ("skyline-night.png", "skyline-night-alpha.png"),
        ("museum-day.png", "museum-day-alpha.png"),
        ("museum-night.png", "museum-night-alpha.png"),
        ("bushes-1.png", "bushes-1-alpha.png"),
        ("bushes-2.png", "bushes-2-alpha.png"),
        ("bushes-3.png", "bushes-3-alpha.png"),
        ("bushes-4.png", "bushes-4-alpha.png"),
        ("staircase-main.png", "staircase-main-alpha.png"),
        ("staircase-upper.png", "staircase-upper-alpha.png"),
        ("light-left-off.png", "light-left-off-alpha.png"),
        ("light-right-off.png", "light-right-off-alpha.png"),
    ):
        key_background(source_name, output_name)
