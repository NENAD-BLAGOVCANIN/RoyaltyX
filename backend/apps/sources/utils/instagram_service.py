import requests


class InstagramService:

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
        url = "https://graph.instagram.com/refresh_access_token"
        params = {
            "grant_type": "ig_refresh_token",
            "access_token": refresh_token,
        }

        response = requests.get(url, params=params)
        if response.status_code == 200:
            return response.json()
        else:
            response.raise_for_status()

    def fetch_user_info(self) -> dict:
        """
        Get basic user info (username, id, etc.).
        """
        params = {
            "fields": "id,username,account_type,media_count"
        }
        url = f"https://graph.instagram.com/me"
        response = requests.get(url, headers=self.headers, params=params)
        if response.status_code == 200:
            return response.json()
        else:
            response.raise_for_status()

    def fetch_media(self, limit: int = 25) -> list[dict]:
        """
        Get user media list.
        """
        params = {
            "fields": "id,media_type,media_url,permalink,thumbnail_url,timestamp,caption,like_count,comments_count",
            "limit": limit
        }
        url = f"https://graph.instagram.com/me/media"
        response = requests.get(url, headers=self.headers, params=params)
        if response.status_code == 200:
            return response.json().get("data", [])
        else:
            response.raise_for_status()

    def fetch_insights(self, media_id: str) -> dict:
        """
        Fetch Instagram media insights for a given media ID.
        Note: This requires Instagram Business or Creator account.
        """
        params = {
            "metric": "views"
        }
        url = f"https://graph.instagram.com/{media_id}/insights"
        response = requests.get(url, headers=self.headers, params=params)
        if response.status_code == 200:
            return response.json()["data"]
        else:
            response.raise_for_status()
