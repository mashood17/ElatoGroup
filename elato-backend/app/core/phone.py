"""
Shared phone validation — mirrors elato-web/src/lib/countryCodes.ts and
validatePhoneForCountry exactly. India (+91) and UAE (+971) keep the
specific digit-shape rules the app has always enforced for its two
established markets; every other E.164 dial code — the frontend's
country-code dropdown offers many now — is accepted under a generic
length/shape check rather than a bespoke rule per country.

Used by every schema that accepts a phone number (enquiries, offer
registrations) so the rule lives in exactly one place.
"""

import re

_STRICT_RULES: dict[str, str] = {
    "+91": r"^\+91[6-9]\d{9}$",
    "+971": r"^\+971[2-9]\d{7,8}$",
}
_GENERIC_RE = r"^\+[1-9]\d{6,14}$"


def normalize_and_validate_phone(raw: str) -> str:
    """Strips whitespace/hyphens and validates; returns the cleaned E.164
    string or raises ValueError with a user-facing message."""
    cleaned = re.sub(r"[\s-]", "", raw.strip())
    for prefix, pattern in _STRICT_RULES.items():
        if cleaned.startswith(prefix):
            if not re.match(pattern, cleaned):
                raise ValueError(f"Enter a valid {prefix} number.")
            return cleaned
    if not re.match(_GENERIC_RE, cleaned):
        raise ValueError("Enter a valid phone number in international format.")
    return cleaned
