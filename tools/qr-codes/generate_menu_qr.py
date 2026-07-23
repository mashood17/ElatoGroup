#!/usr/bin/env python3
"""Regenerates the ELATŌ Menu QR code.

Usage:
    python generate_menu_qr.py

Overwrites assets/qr/menu-qr.png in place (same filename every run — no
manual cleanup, no random names). To change the destination URL, edit
MENU_URL in qr_configs.py and rerun this script; nothing else changes.
"""

from qr_configs import MENU_QR
from qr_generator import generate_qr

if __name__ == "__main__":
    output = generate_qr(MENU_QR)
    print(f"Menu QR regenerated -> {output}")
