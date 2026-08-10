"""Recover true alpha for the team frame exports via dual-background
differencing.

The MCP export API composites every PNG onto a backdrop, so each asset was
exported twice inside a wrapper frame filled black, then white. For matte
recovery: observed = art * a + backdrop * (1 - a), hence per pixel
a = 1 - (white - black) / 255 and art = black / a.
"""

from __future__ import annotations

from pathlib import Path

from process_figma_assets import decode_rgba, encode_rgba

SOURCE_DIR = Path("/tmp/team-alpha")
ASSET_DIR = Path(__file__).parent / "assets"

OUTPUTS = {
    "maia": "team-frame-maia.png",
    "zahra": "team-frame-zahra.png",
    "carolyn": "team-frame-carolyn.png",
    "lucy": "team-frame-lucy.png",
    "cole": "team-frame-cole.png",
    "floor": "team-floor.png",
}


def derive(name: str, output_name: str) -> None:
    width_b, height_b, rows_b = decode_rgba(SOURCE_DIR / f"{name}-black.png")
    width_w, height_w, rows_w = decode_rgba(SOURCE_DIR / f"{name}-white.png")
    if (width_b, height_b) != (width_w, height_w):
        raise ValueError(f"{name}: size mismatch {width_b}x{height_b} vs {width_w}x{height_w}")

    for row_b, row_w in zip(rows_b, rows_w):
        for index in range(0, len(row_b), 4):
            deltas = [
                row_w[index + channel] - row_b[index + channel]
                for channel in range(3)
            ]
            alpha = 1 - (sum(deltas) / 3) / 255
            alpha = min(1.0, max(0.0, alpha))
            if alpha <= 0.004:
                row_b[index : index + 4] = b"\x00\x00\x00\x00"
                continue
            for channel in range(3):
                row_b[index + channel] = min(
                    255, round(row_b[index + channel] / alpha)
                )
            row_b[index + 3] = round(alpha * 255)

    encode_rgba(ASSET_DIR / output_name, width_b, height_b, rows_b)
    print(f"{name} -> {output_name} ({width_b}x{height_b})")


if __name__ == "__main__":
    for name, output_name in OUTPUTS.items():
        derive(name, output_name)
