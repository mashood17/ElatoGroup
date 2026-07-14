"""
Upload -> validate -> resize -> convert -> store -> record, in one place.
Every admin upload (menu photos, gallery, room photos, etc.) goes through
`process_and_store`; nothing writes to Storage or the `media` table directly.
"""

import io
import uuid
from dataclasses import dataclass

from PIL import Image
from fastapi import UploadFile

import pillow_avif  # noqa: F401  registers the AVIF codec with Pillow on import
from app.core.exceptions import AppError
from app.db import get_supabase
from app.repositories import media_repository

# First few bytes of each format — checked against the real file content,
# never the filename/extension, per the media-pipeline spec.
_MAGIC_BYTES: dict[bytes, str] = {
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"RIFF": "image/webp",  # WEBP also needs bytes 8-12 == "WEBP", checked below
}

_BREAKPOINTS = {"thumbnail": 320, "sm": 640, "lg": 1280}
# Must match the buckets that actually exist in the live Supabase project —
# migration 0001's `insert into storage.buckets` used different names
# (menu-images/hero-assets/rooms/avatars) that were never applied; the
# buckets that exist were created separately, matching the product brief's
# Section 4 table. Corrected here rather than editing 0001.
_VALID_BUCKETS = {
    "public-assets",
    "logos",
    "hero",
    "gallery",
    "categories",
    "menu",
    "events",
    "stay",
    "reviews",
    "uploads",
}


@dataclass
class StoredVariant:
    url: str
    width: int
    height: int
    format: str


def _sniff_image_type(raw: bytes) -> str:
    for magic, mime in _MAGIC_BYTES.items():
        if raw.startswith(magic):
            if magic == b"RIFF" and raw[8:12] != b"WEBP":
                continue
            return mime
    raise AppError(code="invalid_file", message="File is not a recognized image (checked by content, not extension).", status_code=422)


def _encode(img: Image.Image, fmt: str) -> bytes:
    buf = io.BytesIO()
    save_kwargs = {"quality": 82} if fmt in ("WEBP", "AVIF") else {}
    img.convert("RGB" if fmt in ("JPEG", "AVIF") else "RGBA" if img.mode == "RGBA" else "RGB").save(
        buf, format=fmt, **save_kwargs
    )
    return buf.getvalue()


async def process_and_store(
    file: UploadFile,
    bucket: str,
    alt_text: str | None,
    uploaded_by: str,
) -> tuple[dict, list[StoredVariant]]:
    if bucket not in _VALID_BUCKETS:
        raise AppError(code="invalid_bucket", message=f"Unknown storage bucket '{bucket}'.", status_code=422)

    raw = await file.read()
    if len(raw) > 15 * 1024 * 1024:
        raise AppError(code="file_too_large", message="Images must be 15MB or smaller.", status_code=422)

    _sniff_image_type(raw)  # raises if not a real image

    try:
        source = Image.open(io.BytesIO(raw))
        source.load()
    except Exception as exc:
        raise AppError(code="invalid_file", message="Could not decode image.", status_code=422) from exc

    supabase = get_supabase()
    stem = uuid.uuid4().hex
    variants: list[StoredVariant] = []
    canonical_path = ""

    for label, max_width in _BREAKPOINTS.items():
        resized = source.copy()
        resized.thumbnail((max_width, max_width * 4), Image.LANCZOS)

        for fmt, ext, content_type in (("WEBP", "webp", "image/webp"), ("JPEG", "jpg", "image/jpeg")):
            encoded = _encode(resized, fmt)
            path = f"{stem}/{label}.{ext}"
            supabase.storage.from_(bucket).upload(
                path, encoded, {"content-type": content_type, "cache-control": "31536000"}
            )
            public_url = supabase.storage.from_(bucket).get_public_url(path)
            variants.append(StoredVariant(url=public_url, width=resized.width, height=resized.height, format=fmt.lower()))
            if label == "lg" and fmt == "WEBP":
                canonical_path = path

        try:
            avif_encoded = _encode(resized, "AVIF")
            avif_path = f"{stem}/{label}.avif"
            supabase.storage.from_(bucket).upload(
                avif_path, avif_encoded, {"content-type": "image/avif", "cache-control": "31536000"}
            )
            public_url = supabase.storage.from_(bucket).get_public_url(avif_path)
            variants.append(StoredVariant(url=public_url, width=resized.width, height=resized.height, format="avif"))
        except Exception:
            pass  # AVIF is best-effort; WebP/JPEG fallback above always succeeds.

    media_row = media_repository.create(
        {
            "storage_path": canonical_path,
            "alt_text": alt_text,
            "width": source.width,
            "height": source.height,
            "bucket": bucket,
            "uploaded_by": uploaded_by,
        }
    )
    return media_row, variants
