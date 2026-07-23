"""Reusable branded QR code generator for ELATŌ.

Core rendering logic shared by every per-destination script (e.g.
generate_menu_qr.py). Adding a new QR code (Stay, Events, Website,
Instagram, WhatsApp, ...) only requires a new QRConfig in qr_configs.py —
nothing in this file needs to change.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import qrcode
from qrcode.constants import ERROR_CORRECT_H
from PIL import Image, ImageDraw

# Target long edge in pixels. High-error-correction QRs stay scannable at
# small sizes too, but table stands, A4 sheets and posters need real
# resolution, so box_size (px per module) is computed to hit this instead
# of a fixed, print-size-agnostic default.
TARGET_SIZE_PX = 3000

# The QR spec's minimum quiet zone is 4 modules on every side. Never go
# below this — cropping it is the single most common cause of scan failures.
QUIET_ZONE_MODULES = 4


@dataclass(frozen=True)
class QRConfig:
    url: str
    output_path: Path
    fill_color: str = "#9E7641"
    back_color: str = "#E7CAA0"
    with_logo: bool = True
    logo_scale: float = 0.20  # fraction of the QR's width the center badge occupies


def generate_qr(config: QRConfig) -> Path:
    """Renders `config` to disk, overwriting any previous file at the same
    path. Returns the output path."""
    qr = qrcode.QRCode(
        error_correction=ERROR_CORRECT_H,  # ~30% recoverable — headroom for the center logo
        border=QUIET_ZONE_MODULES,
    )
    qr.add_data(config.url)
    qr.make(fit=True)

    modules = qr.modules_count
    qr.box_size = max(10, TARGET_SIZE_PX // (modules + 2 * QUIET_ZONE_MODULES))

    img = qr.make_image(fill_color=config.fill_color, back_color=config.back_color).convert("RGB")

    if config.with_logo:
        img = _apply_center_logo(img, config)

    config.output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(config.output_path, format="PNG")
    return config.output_path


def _apply_center_logo(img: Image.Image, config: QRConfig) -> Image.Image:
    logo_size = round(img.width * config.logo_scale)
    logo = _draw_logomark(logo_size, fg=config.fill_color, bg=config.back_color)
    pos = ((img.width - logo_size) // 2, (img.height - logo_size) // 2)
    img.paste(logo, pos, logo)
    return img


def _draw_logomark(size: int, fg: str, bg: str) -> Image.Image:
    """Redraws the ELATŌ favicon mark (ring + bar, see public/favicon.svg)
    at `size`px using only the QR's own fill/back colors, so the badge
    reads as part of the code rather than a pasted sticker, and no SVG
    rasterization dependency is needed."""
    logo = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(logo)

    pad = round(size * 0.06)
    draw.rounded_rectangle([pad, pad, size - pad, size - pad], radius=round(size * 0.22), fill=bg)

    ring_r = round(size * 0.24)
    cx, cy = size // 2, round(size * 0.56)
    draw.ellipse(
        [cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r],
        outline=fg,
        width=round(size * 0.10),
    )

    bar_w, bar_h = round(size * 0.34), round(size * 0.085)
    bar_x, bar_y = cx - bar_w // 2, round(size * 0.18)
    draw.rounded_rectangle(
        [bar_x, bar_y, bar_x + bar_w, bar_y + bar_h],
        radius=bar_h // 2,
        fill=fg,
    )
    return logo
