"""
Admin-managed hero background videos (desktop + mobile slots).

Today this validates -> stores the uploaded file as-is in Supabase Storage
-> best-effort probes duration/dimensions and extracts a poster frame via
PyAV (which bundles its own decoder libraries, so no system ffmpeg install
is required). No compression/transcoding happens yet.

Deliberately structured so that changes: everything that inspects or
transforms the raw bytes goes through the `VideoProcessor` protocol below.
Swapping `_processor` for an implementation that also returns transcoded
WebM/MP4 variants (via ffmpeg, Cloudinary, or anything else) is the only
change needed to add real transcoding later — the API routes, the DB schema,
and the frontend all already treat "one stored video + optional poster" as
the contract and don't need to change.
"""

from __future__ import annotations

import io
import uuid
from dataclasses import dataclass
from typing import Any, Protocol

from fastapi import UploadFile

from app.core.config import get_settings
from app.core.exceptions import AppError
from app.db import get_supabase
from app.repositories import hero_background_repository
from app.services import media_service

VIDEO_BUCKET = "hero-videos"
POSTER_BUCKET = "hero"
SLOTS = ("desktop", "mobile")

_ALLOWED_VIDEO_MIME = {"video/mp4": "mp4", "video/webm": "webm"}
# Hero videos loop — anything longer is almost certainly the wrong file, not
# a legitimate hero clip.
_MAX_DURATION_SECONDS = 20
_MIN_DIMENSION = 480
_MAX_DIMENSION = 3840


@dataclass
class VideoProbe:
    width: int | None = None
    height: int | None = None
    duration_seconds: float | None = None
    poster_jpeg: bytes | None = None


class VideoProcessor(Protocol):
    def probe(self, raw: bytes) -> VideoProbe: ...


class PyAvProbe:
    """Best-effort metadata + poster-frame extraction using PyAV. Any
    failure (library not installed, unsupported container, corrupt file)
    degrades to an empty probe rather than blocking the upload — duration/
    dimension checks are simply skipped, and the admin can upload a poster
    image manually via the fallback endpoint."""

    def probe(self, raw: bytes) -> VideoProbe:
        try:
            import av
        except ImportError:
            return VideoProbe()

        try:
            container = av.open(io.BytesIO(raw))
            try:
                stream = next((s for s in container.streams if s.type == "video"), None)
                if stream is None:
                    return VideoProbe()

                width, height = stream.width, stream.height

                duration_seconds: float | None = None
                if stream.duration and stream.time_base:
                    duration_seconds = float(stream.duration * stream.time_base)
                elif container.duration:
                    duration_seconds = container.duration / 1_000_000

                poster_jpeg = None
                try:
                    for frame in container.decode(stream):
                        poster_jpeg = _frame_to_jpeg(frame)
                        break
                except Exception:
                    poster_jpeg = None

                return VideoProbe(
                    width=width, height=height, duration_seconds=duration_seconds, poster_jpeg=poster_jpeg
                )
            finally:
                container.close()
        except Exception:
            return VideoProbe()


def _frame_to_jpeg(frame: Any) -> bytes:
    img = frame.to_image().convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return buf.getvalue()


_processor: VideoProcessor = PyAvProbe()


def _sniff_video_mime(raw: bytes) -> str:
    # Checked against real file content, not the filename/extension — same
    # rule the image pipeline (media_service._sniff_image_type) follows.
    if len(raw) >= 8 and raw[4:8] == b"ftyp":
        return "video/mp4"
    if raw[:4] == b"\x1a\x45\xdf\xa3":
        return "video/webm"
    raise AppError(code="invalid_file", message="File is not a recognized MP4 or WebM video.", status_code=422)


async def upload_hero_video(file: UploadFile, slot: str, uploaded_by: str) -> dict[str, Any]:
    if slot not in SLOTS:
        raise AppError(code="invalid_slot", message=f"Slot must be one of {SLOTS}.", status_code=422)

    raw = await file.read()
    if not raw:
        raise AppError(code="invalid_file", message="Uploaded file is empty.", status_code=422)

    max_bytes = get_settings().hero_video_max_bytes
    if len(raw) > max_bytes:
        limit_mb = max_bytes // (1024 * 1024)
        raise AppError(
            code="file_too_large",
            message=f"Video is too large — please keep hero videos under {limit_mb}MB. Pre-compress before uploading.",
            status_code=422,
        )

    mime = _sniff_video_mime(raw)
    ext = _ALLOWED_VIDEO_MIME[mime]

    probe = _processor.probe(raw)
    if probe.duration_seconds is not None and probe.duration_seconds > _MAX_DURATION_SECONDS:
        raise AppError(
            code="video_too_long",
            message=(
                f"Hero videos must be {_MAX_DURATION_SECONDS}s or shorter (this one is "
                f"{probe.duration_seconds:.1f}s) — they loop, so keep it short."
            ),
            status_code=422,
        )
    if probe.width and probe.height:
        if min(probe.width, probe.height) < _MIN_DIMENSION:
            raise AppError(
                code="video_too_small",
                message=f"Resolution is too low ({probe.width}x{probe.height}) — minimum {_MIN_DIMENSION}px on the shorter side.",
                status_code=422,
            )
        if max(probe.width, probe.height) > _MAX_DIMENSION:
            raise AppError(
                code="video_dimensions_too_large",
                message=f"Resolution is too high ({probe.width}x{probe.height}) — please pre-compress to {_MAX_DIMENSION}px or under on the longer side.",
                status_code=422,
            )

    supabase = get_supabase()
    stem = uuid.uuid4().hex
    video_path = f"{slot}/{stem}.{ext}"
    supabase.storage.from_(VIDEO_BUCKET).upload(video_path, raw, {"content-type": mime, "cache-control": "31536000"})

    poster_bucket = None
    poster_path = None
    if probe.poster_jpeg:
        poster_path = f"hero-video-posters/{slot}/{stem}.jpg"
        supabase.storage.from_(POSTER_BUCKET).upload(
            poster_path, probe.poster_jpeg, {"content-type": "image/jpeg", "cache-control": "31536000"}
        )
        poster_bucket = POSTER_BUCKET

    existing = hero_background_repository.get_by_slot(slot)
    row = hero_background_repository.upsert(
        slot,
        {
            "video_bucket": VIDEO_BUCKET,
            "video_path": video_path,
            "video_mime": mime,
            "file_size_bytes": len(raw),
            "width": probe.width,
            "height": probe.height,
            "duration_seconds": probe.duration_seconds,
            "poster_bucket": poster_bucket,
            "poster_path": poster_path,
            "uploaded_by": uploaded_by,
        },
    )

    if existing:
        _delete_storage_object(existing["video_bucket"], existing["video_path"])
        if existing.get("poster_bucket") and existing.get("poster_path"):
            media_service.delete_image_variants(existing["poster_bucket"], existing["poster_path"])

    return row


async def upload_hero_poster(file: UploadFile, slot: str, uploaded_by: str) -> dict[str, Any]:
    """Manual poster fallback for when automatic extraction wasn't feasible
    (PyAV unavailable, unusual codec, extraction failure, etc.) — routes
    through the same optimized image pipeline every other admin image
    upload uses, so the stored poster gets the usual resize/WebP treatment."""
    if slot not in SLOTS:
        raise AppError(code="invalid_slot", message=f"Slot must be one of {SLOTS}.", status_code=422)

    existing = hero_background_repository.get_by_slot(slot)
    if not existing:
        raise AppError(code="not_found", message=f"Upload a {slot} hero video first.", status_code=404)

    media_row, _variants = await media_service.process_and_store(file, POSTER_BUCKET, f"{slot} hero poster", uploaded_by)

    old_poster_bucket, old_poster_path = existing.get("poster_bucket"), existing.get("poster_path")
    row = hero_background_repository.upsert(
        slot, {"poster_bucket": POSTER_BUCKET, "poster_path": media_row["storage_path"]}
    )

    if old_poster_bucket and old_poster_path and old_poster_path != media_row["storage_path"]:
        media_service.delete_image_variants(old_poster_bucket, old_poster_path)

    return row


def delete_hero_video(slot: str) -> None:
    if slot not in SLOTS:
        raise AppError(code="invalid_slot", message=f"Slot must be one of {SLOTS}.", status_code=422)
    row = hero_background_repository.get_by_slot(slot)
    if not row:
        return
    _delete_storage_object(row["video_bucket"], row["video_path"])
    if row.get("poster_bucket") and row.get("poster_path"):
        media_service.delete_image_variants(row["poster_bucket"], row["poster_path"])
    hero_background_repository.delete(slot)


def _delete_storage_object(bucket: str, path: str) -> None:
    try:
        get_supabase().storage.from_(bucket).remove([path])
    except Exception:
        pass  # best-effort cleanup — a dangling old object is harmless, unlike failing the request over it


def resolve_urls(row: dict[str, Any]) -> tuple[str, str | None]:
    supabase = get_supabase()
    video_url = supabase.storage.from_(row["video_bucket"]).get_public_url(row["video_path"])
    poster_url = None
    if row.get("poster_bucket") and row.get("poster_path"):
        poster_url = supabase.storage.from_(row["poster_bucket"]).get_public_url(row["poster_path"])
    return video_url, poster_url


def to_schema(row: dict[str, Any]):
    """Shared row -> HeroBackgroundOut mapping for both the admin and public
    routers, so URL resolution logic lives in exactly one place."""
    from app.schemas.hero_background import HeroBackgroundOut

    video_url, poster_url = resolve_urls(row)
    return HeroBackgroundOut(
        slot=row["slot"],
        video_url=video_url,
        video_mime=row["video_mime"],
        poster_url=poster_url,
        width=row.get("width"),
        height=row.get("height"),
        duration_seconds=row.get("duration_seconds"),
        file_size_bytes=row["file_size_bytes"],
        updated_at=row["updated_at"],
    )
