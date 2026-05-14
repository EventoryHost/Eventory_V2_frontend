import os
import time
import random
from typing import Optional, Dict, Any, Callable
from pathlib import Path
import json
from instagrapi import Client

class InstagramService:
    def __init__(self, download_base_dir: str = "downloads"):
        self.cl = Client()
        # Random delays to mimic human behavior
        self.cl.delay_range = [1, 3]
        
        self.base_dir = Path(download_base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self._session_loaded = False

    def load_cookies(self, cookies: dict):
        """
        Load Instagram session using instagrapi.
        Required: sessionid.
        """
        if "sessionid" in cookies:
            self.cl.login_by_sessionid(cookies["sessionid"])
            self._session_loaded = True
            print("[INFO] Session loaded into instagrapi.")
        else:
            print("[WARN] No sessionid found in cookies.")

    def load_cookies_from_json(self, path: str):
        """Load cookies from a persisted JSON file."""
        if os.path.exists(path):
            with open(path) as f:
                cookies = json.load(f)
            self.load_cookies(cookies)

    def has_session(self) -> bool:
        return self._session_loaded

    def get_profile_info(self, username: str) -> Dict[str, Any]:
        try:
            user_id = self.cl.user_id_from_username(username)
            info = self.cl.user_info(user_id)
            return {
                "username": info.username,
                "userid": info.pk,
                "full_name": info.full_name,
                "biography": info.biography,
                "follower_count": info.follower_count,
                "following_count": info.following_count,
                "post_count": info.media_count,
                "profile_pic_url": str(info.profile_pic_url),
                "is_private": info.is_private,
                "is_verified": info.is_verified
            }
        except Exception as e:
            raise Exception(f"Failed to fetch profile for {username}: {str(e)}")

    def download_account(
        self,
        username: str,
        limit: Optional[int] = None,
        progress_callback: Optional[Callable[[int, int], None]] = None,
    ) -> Dict[str, Any]:
        try:
            user_id = self.cl.user_id_from_username(username)
            info = self.cl.user_info(user_id)

            if info.is_private and not info.is_verified: # Basic check, private is true if we don't follow
                # Sometimes private accounts you follow can be downloaded
                pass 

            user_dir = self.base_dir / username
            user_dir.mkdir(exist_ok=True)

            profile_dir = user_dir / "profile"
            profile_dir.mkdir(exist_ok=True)
            try:
                # Download profile pic
                pic_path = self.cl.photo_download_by_url(str(info.profile_pic_url), folder=profile_dir)
                print(f"[OK] Downloaded profile pic to {pic_path}")
            except Exception as e:
                print(f"[WARN] Failed to download profile pic: {e}")

            count = 0
            skipped = 0
            total = info.media_count

            # Fetch media
            fetch_limit = limit if limit else 0 # 0 means all in instagrapi
            medias = self.cl.user_medias(user_id, fetch_limit)

            for media in medias:
                if limit and count >= limit:
                    break

                shortcode = media.code
                year = str(media.taken_at.year)
                target_dir = user_dir / "posts" / year
                target_dir.mkdir(parents=True, exist_ok=True)

                existing = list(target_dir.glob(f"{shortcode}*"))
                if existing:
                    print(f"[SKIP] {shortcode} already exists. Skipping.")
                    skipped += 1
                    continue

                # Download logic based on media type
                try:
                    if media.media_type == 1:
                        # Photo
                        self.cl.photo_download(media.pk, folder=target_dir)
                    elif media.media_type == 2:
                        # Video
                        self.cl.video_download(media.pk, folder=target_dir)
                    elif media.media_type == 8:
                        # Album (carousel)
                        self.cl.album_download(media.pk, folder=target_dir)
                    
                    # Save metadata as JSON
                    metadata_path = target_dir / f"{shortcode}.json"
                    with open(metadata_path, "w", encoding="utf-8") as f:
                        json.dump(media.dict(), f, indent=4, default=str)

                    count += 1
                    if progress_callback:
                        progress_callback(count, total)

                    print(f"[OK] Downloaded {shortcode}")
                    time.sleep(random.uniform(1.5, 4.0))

                except Exception as media_err:
                    print(f"[ERROR] Failed to download {shortcode}: {media_err}")

            return {
                "status": "success",
                "total_downloaded": count,
                "total_skipped": skipped,
                "username": username,
            }

        except Exception as e:
            print(f"[ERROR] download_account({username}): {e}")
            raise e
