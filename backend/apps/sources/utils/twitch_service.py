import requests
from django.conf import settings


class TwitchService:

    def __init__(self, access_token: str):
        self.access_token = access_token
        self.headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
            "Client-Id": settings.TWITCH_CLIENT_ID
        }

    @staticmethod
    def refresh_token(refresh_token: str) -> str:
        """
        Get a new access token using refresh token.
        """
        url = "https://id.twitch.tv/oauth2/token"
        data = {
            "client_id": settings.TWITCH_CLIENT_ID,
            "client_secret": settings.TWITCH_CLIENT_SECRET,
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
        url = "https://api.twitch.tv/helix/users"
        response = requests.get(url, headers=self.headers)
        if response.status_code == 200:
            data = response.json().get("data", [])
            if data:
                return data[0]
        else:
            response.raise_for_status()

    def fetch_video_stats(self, video_id: str) -> dict:
        """
        Fetch Twitch video stats for a given video ID.
        """
        url = f"https://api.twitch.tv/helix/videos"
        params = {
            "id": video_id
        }
        response = requests.get(url, headers=self.headers, params=params)
        if response.status_code == 200:
            data = response.json().get("data", [])
            if data:
                return data[0]
        else:
            response.raise_for_status()

    def fetch_videos(self, user_id: str = None) -> list[dict]:
        """
        Get user video list (VODs).
        If user_id is not provided, it will fetch for the authenticated user.
        """
        if not user_id:
            user_info = self.fetch_user_info()
            user_id = user_info.get("id")

        url = "https://api.twitch.tv/helix/videos"
        params = {
            "user_id": user_id,
            "first": 100, 
            "type": "all"  
        }
        response = requests.get(url, headers=self.headers, params=params)
        if response.status_code == 200:
            return response.json().get("data", [])
        else:
            response.raise_for_status()
