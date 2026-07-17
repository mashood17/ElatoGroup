"""Public enquiry submissions. There is no admin management UI for these —
this repository exists solely to back the public POST /enquiries endpoint in
app/api/v1/public.py."""

from typing import Any

from app.repositories.base import client, unwrap_single

TABLE = "enquiries"


def create(fields: dict[str, Any]) -> dict[str, Any]:
    res = client().table(TABLE).insert(fields).execute()
    return unwrap_single(res.data, "Enquiry not created")
