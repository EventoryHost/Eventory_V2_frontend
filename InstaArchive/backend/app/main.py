from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from app.services.instagram import InstagramService
from app.core.config import settings
from pydantic import BaseModel
from typing import Optional
import os
import json

app = FastAPI(title=settings.PROJECT_NAME)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ig_service = InstagramService(download_base_dir=settings.DOWNLOAD_DIR)

# Auto-load session on startup if file exists
SESSION_FILE = os.path.join(os.path.dirname(__file__), "..", "session.json")
if os.path.exists(SESSION_FILE):
    try:
        ig_service.load_cookies_from_json(SESSION_FILE)
        print(f"[INFO] Session loaded from {SESSION_FILE}")
    except Exception as e:
        print(f"[WARN] Could not load session: {e}")


class SyncRequest(BaseModel):
    username: str
    limit: Optional[int] = None


class SessionRequest(BaseModel):
    """
    Paste the value of the 'sessionid' cookie from your browser
    (Instagram → DevTools → Application → Cookies → sessionid).
    """
    sessionid: str
    csrftoken: Optional[str] = None
    ds_user_id: Optional[str] = None


@app.get("/")
def read_root():
    return {"message": "InstaArchive API is running", "docs": "/docs"}


@app.post("/api/v1/session")
def import_session(req: SessionRequest):
    """
    Import your Instagram browser cookies so the scraper uses an
    authenticated session and avoids 429 rate-limit blocks.
    """
    try:
        cookies = {"sessionid": req.sessionid}
        if req.csrftoken:
            cookies["csrftoken"] = req.csrftoken
        if req.ds_user_id:
            cookies["ds_user_id"] = req.ds_user_id

        ig_service.load_cookies(cookies)

        # Persist to disk so it survives container restarts
        with open(SESSION_FILE, "w") as f:
            json.dump(cookies, f)

        return {"status": "ok", "message": "Session imported successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/v1/profile/{username}")
def get_profile(username: str):
    try:
        profile_info = ig_service.get_profile_info(username)
        return profile_info
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/api/v1/sync")
def sync_account(request: SyncRequest, background_tasks: BackgroundTasks):
    try:
        background_tasks.add_task(
            ig_service.download_account, request.username, request.limit
        )
        return {"message": f"Sync started for @{request.username}", "status": "processing"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/status/{username}")
def get_status(username: str):
    path = os.path.join(settings.DOWNLOAD_DIR, username)
    if not os.path.exists(path):
        return {"username": username, "status": "not_found"}

    # Count media files
    media_count = 0
    json_count = 0
    for root, dirs, files in os.walk(path):
        for file in files:
            if file.endswith((".jpg", ".mp4", ".png")):
                media_count += 1
            elif file.endswith(".json"):
                json_count += 1

    return {
        "username": username,
        "status": "archived",
        "downloaded_media": media_count,
        "metadata_files": json_count,
        "download_path": path,
    }


@app.get("/api/v1/session/status")
def session_status():
    """Check if a session is loaded."""
    has_session = ig_service.has_session()
    return {
        "session_loaded": has_session,
        "hint": "POST /api/v1/session with your Instagram sessionid cookie to avoid rate limits"
        if not has_session
        else "Session is active",
    }
