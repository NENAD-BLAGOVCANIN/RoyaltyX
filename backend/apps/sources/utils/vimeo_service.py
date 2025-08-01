import requests
from django.conf import settings


class VimeoService:

    def __init__(self, access_token: str):
        self.access_token = access_token
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.access_token}"
        }
        self.base_url = "https://api.vimeo.com"

    def fetch_user_info(self) -> dict:
        """
        Get basic user info (username, id, etc.).
        """
        url = f"{self.base_url}/me"
        response = requests.get(url, headers=self.headers)
        if response.status_code == 200:
            data = response.json()
            return {
                'user_id': data.get('uri', '').split('/')[-1],
                'display_name': data.get('name', '')
            }
        else:
            response.raise_for_status()

    def fetch_video_stats(self, video_id: str) -> dict:
        """
        Fetch Vimeo video stats for a given video ID.
        """
        url = f"{self.base_url}/videos/{video_id}"
        response = requests.get(url, headers=self.headers)
        if response.status_code == 200:
            data = response.json()
            return {
                'id': data.get('uri', '').split('/')[-1],
                'title': data.get('name', ''),
                'description': data.get('description', ''),
                'view_count': data.get('stats', {}).get('plays', 0),
                'status': data.get('status', ''),
            }
        else:
            response.raise_for_status()

    def fetch_videos(self) -> dict:
        """
        Get user video list with pagination.
        """
        params = {
            'page': 1,
            'per_page': 100,
            'fields': 'uri,name,description,stats,pictures'
        }
        
        url = f"{self.base_url}/me/videos"
        response = requests.get(url, headers=self.headers, params=params)
        if response.status_code == 200:
            data = response.json()
            videos = []
            
            for video in data.get('data', []):
                videos.append({
                    'id': video.get('uri', '').split('/')[-1],
                    'title': video.get('name', ''),
                    'description': video.get('description', ''),
                    'view_count': video.get('stats', {}).get('plays', 0),
                    'thumbnail_url': video.get('pictures', {}).get('base_link', ''),
                })
            
            return videos
        else:
            response.raise_for_status()
