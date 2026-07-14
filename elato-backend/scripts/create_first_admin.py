"""One-off bootstrap: create the first owner admin account.
Usage: .venv/Scripts/python.exe scripts/create_first_admin.py <email> <password>
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.security import hash_password
from app.repositories import admin_repository


def main() -> None:
    if len(sys.argv) != 3:
        print("Usage: create_first_admin.py <email> <password>")
        sys.exit(1)
    email, password = sys.argv[1], sys.argv[2]

    existing = admin_repository.get_by_email(email)
    if existing:
        print(f"Admin already exists: {email} (role={existing['role']})")
        return

    admin = admin_repository.create(email, hash_password(password), "owner")
    print(f"Created owner admin: {admin['email']} (id={admin['id']})")


if __name__ == "__main__":
    main()
