import requests
from django.conf import settings


class TikTokService:

    def __init__(self, access_token: str):
        self.access_token = access_token
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.access_token}"
        }

    @staticmethod
    def refresh_token(refresh_token: str) -> str:
        """
        Get a new access token using refresh token.
        """
        url = "https://open.tiktokapis.com/v2/oauth/token/"
        data = {
            "client_key": settings.TIKTOK_CLIENT_ID,
            "client_secret": settings.TIKTOK_CLIENT_SECRET,
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
        }

        response = requests.post(url, data=data)
        if response.status_code == 200:
            return response.json()
        else:
            response.raise_for_status()


    def fetch_user_info(self) -> dict:
        """
        Get basic user info (username, id, etc.).
        """
        params = {
            "fields": "open_id, display_name"
        }
        url = "https://open.tiktokapis.com/v2/user/info/"
        response = requests.get(url, headers=self.headers, params=params)
        if response.status_code == 200:
            data = response.json().get("data", {})
            if data:
                return data.get('user', {})
        else:
            response.raise_for_status()
    

    def fetch_video_stats(self, video_id: str) -> dict:
        """
        Fetch TikTok video stats for a given video ID.
        Adjust the endpoint and parameters to match TikTok API specs.
        """
        url = "https://open.tiktokapis.com/v2/video/query/"  
        params = {
            "fields": "id, title, view_count"
        }
        data = {
            "filters": {
                "video_ids": [video_id],
            },
        }
        response = requests.post(url, headers=self.headers, params=params, json=data)
        if response.status_code == 200:
            return response.json().get("data", {}).get("videos", [])
        else:
            response.raise_for_status()


    def fetch_videos(self) -> list[dict]:
        """
        Get user video list.
        Note: This requires approval from TikTok for `video.list` permission.
        """
        params = {
            "fields": "id, title, video_description, cover_image_url"
        }
        json_data = {
            "max_count": 20
        }
        url = "https://open.tiktokapis.com/v2/video/list/"
        response = requests.post(url, headers=self.headers, params=params, json=json_data)
        if response.status_code == 200:
            return response.json().get("data", {}).get("videos", [])
        else:
            response.raise_for_status()
