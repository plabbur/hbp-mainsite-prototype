"""Generate deterministic, transparent SVG star fields for the hero.

Two layers are produced so they can rotate at different rates while scrolling,
creating depth without relying on an external image or animation asset.
"""

from __future__ import annotations

import math
import random
from pathlib import Path


WIDTH = 2200
HEIGHT = 1600
ASSET_DIR = Path(__file__).parent / "assets"
COLORS = ("#fffdf7", "#f7edda", "#e8f0ff", "#dbe7ff")


def star_position(rng: random.Random, index: int, count: int) -> tuple[float, float]:
    """Mix an even field with a subtle diagonal Milky Way-like concentration."""
    if index < count * 0.34:
        x = rng.uniform(0, WIDTH)
        band_center = HEIGHT * 0.7 - (x / WIDTH) * HEIGHT * 0.38
        y = rng.gauss(band_center, HEIGHT * 0.1)
        return x, min(HEIGHT, max(0, y))
    return rng.uniform(0, WIDTH), rng.uniform(0, HEIGHT)


def make_field(
    filename: str,
    *,
    seed: int,
    count: int,
    radius_range: tuple[float, float],
    opacity_range: tuple[float, float],
    glow_threshold: float,
) -> None:
    rng = random.Random(seed)
    stars: list[str] = []

    for index in range(count):
        x, y = star_position(rng, index, count)
        brightness = rng.random() ** 2.3
        radius = radius_range[0] + (radius_range[1] - radius_range[0]) * brightness
        opacity = opacity_range[0] + (
            opacity_range[1] - opacity_range[0]
        ) * math.sqrt(brightness)
        color = rng.choice(COLORS)

        if brightness > glow_threshold:
            stars.append(
                (
                    f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{radius * 4.2:.2f}" '
                    f'fill="{color}" opacity="{opacity * 0.13:.3f}" '
                    'filter="url(#star-glow)" />'
                )
            )

        stars.append(
            (
                f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{radius:.2f}" '
                f'fill="{color}" opacity="{opacity:.3f}" />'
            )
        )

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {HEIGHT}" role="presentation">
  <defs>
    <filter id="star-glow" x="-200%" y="-200%" width="500%" height="500%">
      <feGaussianBlur stdDeviation="2.4" />
    </filter>
  </defs>
  <g>
    {chr(10).join(stars)}
  </g>
</svg>
"""
    (ASSET_DIR / filename).write_text(svg, encoding="utf-8")
    print(f"Generated {filename} with {count} stars")


if __name__ == "__main__":
    ASSET_DIR.mkdir(exist_ok=True)
    make_field(
        "starfield-far.svg",
        seed=2027,
        count=620,
        radius_range=(0.35, 1.45),
        opacity_range=(0.28, 0.9),
        glow_threshold=0.86,
    )
    make_field(
        "starfield-near.svg",
        seed=8675309,
        count=145,
        radius_range=(0.65, 2.15),
        opacity_range=(0.38, 1),
        glow_threshold=0.72,
    )
