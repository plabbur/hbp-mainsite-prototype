"""Map the day skyline fill colors to their twilight/night equivalents.

The three clipped skyline exports are pixel-aligned renders of the same crop,
so for each unique day fill we can find a pixel with that color and read the
corresponding pixel in the twilight and night renders.
"""

from pathlib import Path

from process_figma_assets import decode_rgba

ASSET_DIR = Path(__file__).parent / "assets"
DAY_FILLS = {"back": (0xD6, 0xD6, 0xFF), "front": (0xC5, 0xC7, 0xEA)}


def main() -> None:
    day_w, day_h, day = decode_rgba(ASSET_DIR / "skyline-day.png")
    _, _, twilight = decode_rgba(ASSET_DIR / "skyline-twilight.png")
    _, _, night = decode_rgba(ASSET_DIR / "skyline-night.png")

    alpha_w, alpha_h, bushes = decode_rgba(ASSET_DIR / "bushes-1-full.png")
    corner = tuple(bushes[0][0:4])
    print(f"bushes-1-full: {alpha_w}x{alpha_h}, corner rgba={corner}")

    for label, (r, g, b) in DAY_FILLS.items():
        found = None
        for y in range(0, day_h, 3):
            row = day[y]
            for x in range(0, day_w, 3):
                index = x * 4
                if (
                    row[index] == r
                    and row[index + 1] == g
                    and row[index + 2] == b
                ):
                    found = (x, y)
                    break
            if found:
                break
        if not found:
            print(f"{label}: day color #{r:02X}{g:02X}{b:02X} not found")
            continue
        x, y = found
        tw = twilight[y][x * 4 : x * 4 + 3]
        ni = night[y][x * 4 : x * 4 + 3]
        print(
            f"{label}: day #{r:02X}{g:02X}{b:02X} at ({x},{y}) -> "
            f"twilight #{tw[0]:02X}{tw[1]:02X}{tw[2]:02X}, "
            f"night #{ni[0]:02X}{ni[1]:02X}{ni[2]:02X}"
        )


if __name__ == "__main__":
    main()
