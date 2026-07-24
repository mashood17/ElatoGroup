import elatoWordmark from "../../assets/logos/elato-wordmark.webp";

// The source artwork (elato-wordmark.webp, 1180x342) has uneven transparent
// padding baked in — most notably ~13% on the left and ~15% on top — which
// left the rendered logo visibly offset from flush-left text like "ADMIN
// PANEL" below it. These are the measured pixel bounds of the actual glyph
// within that file, used below to crop the padding away via a scaled,
// offset render inside an overflow-hidden box instead of re-exporting the
// asset.
const NATURAL_W = 1180;
const NATURAL_H = 342;
const CROP = { left: 152, top: 49, right: 1025, bottom: 272 };
const CROP_W = CROP.right - CROP.left;
const CROP_H = CROP.bottom - CROP.top;

/**
 * ELATŌ wordmark artwork — same client-supplied asset used by the public
 * site's navbar (elato-web/src/assets/logos/elato-wordmark.webp), reused
 * here so the admin panel's brand mark matches the storefront exactly
 * instead of a re-typed approximation. `height` is in pixels so the crop
 * math above scales exactly with it.
 */
export function Logo({ height = 20, className = "" }: { height?: number; className?: string }) {
  const scale = height / CROP_H;
  const wrapperWidth = CROP_W * scale;

  return (
    <span
      className={`inline-block shrink-0 overflow-hidden align-middle ${className}`}
      style={{ width: wrapperWidth, height }}
    >
      <img
        src={elatoWordmark}
        alt="ELATŌ"
        style={{
          width: NATURAL_W * scale,
          height: NATURAL_H * scale,
          maxWidth: "none",
          marginLeft: -CROP.left * scale,
          marginTop: -CROP.top * scale,
        }}
      />
    </span>
  );
}
