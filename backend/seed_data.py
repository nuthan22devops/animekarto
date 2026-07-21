
Action: file_editor create /app/backend/auth.py --file-text "\"\"\"Authentication utilities: password hashing, JWT tokens, and current user dependency.\"\"\"
import os
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, Request

JWT_ALGORITHM = \"HS256\"
ACCESS_TOKEN_MINUTES = 60 * 24  # 24h for a merch demo
REFRESH_TOKEN_DAYS = 7


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode(\"utf-8\"), salt)
    return hashed.decode(\"utf-8\")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(\"utf-8\"), hashed_password.encode(\"utf-8\"))


def _secret() -> str:
    return os.environ[\"JWT_SECRET\"]


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        \"sub\": user_id,
        \"email\": email,
        \"exp\": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MINUTES),
        \"type\": \"access\",
    }
    return jwt.encode(payload, _secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        \"sub\": user_id,
        \"exp\": datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_DAYS),
        \"type\": \"refresh\",
    }
    return jwt.encode(payload, _secret(), algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, _secret(), algorithms=[JWT_ALGORITHM])


def set_auth_cookies(response, access_token: str, refresh_token: str) -> None:
    response.set_cookie(
        key=\"access_token\", value=access_token, httponly=True,
        secure=False, samesite=\"lax\", max_age=ACCESS_TOKEN_MINUTES * 60, path=\"/\",
    )
    response.set_cookie(
        key=\"refresh_token\", value=refresh_token, httponly=True,
        secure=False, samesite=\"lax\", max_age=REFRESH_TOKEN_DAYS * 24 * 3600, path=\"/\",
    )


def clear_auth_cookies(response) -> None:
    response.delete_cookie(\"access_token\", path=\"/\")
    response.delete_cookie(\"refresh_token\", path=\"/\")


def extract_token(request: Request) -> str | None:
    token = request.cookies.get(\"access_token\")
    if not token:
        auth_header = request.headers.get(\"Authorization\", \"\")
        if auth_header.startswith(\"Bearer \"):
            token = auth_header[7:]
    return token


async def get_current_user_from_db(request: Request, db) -> dict:
    token = extract_token(request)
    if not token:
        raise HTTPException(status_code=401, detail=\"Not authenticated\")
    try:
        payload = decode_token(token)
        if payload.get(\"type\") != \"access\":
            raise HTTPException(status_code=401, detail=\"Invalid token type\")
        user = await db.users.find_one({\"id\": payload[\"sub\"]}, {\"_id\": 0, \"password_hash\": 0})
        if not user:
            raise HTTPException(status_code=401, detail=\"User not found\")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail=\"Token expired\")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail=\"Invalid token\")
"
Observation: Create successful: /app/backend/auth.py