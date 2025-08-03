from django.db import models

from apps.project.models import Project
from common.models import BaseModel
from common.utils.cryptography import decrypt_token, encrypt_token


class Source(BaseModel):
    PLATFORM_YOUTUBE = "youtube"
    PLATFORM_GOOGLE_ADS = "google_ads"
    PLATFORM_FACEBOOK = "facebook"
    PLATFORM_AMAZON = "amazon"
    PLATFORM_TIKTOK = "tiktok"
    PLATFORM_TWITCH = "twitch"

    PLATFORMS = [
        (PLATFORM_YOUTUBE, "YouTube"),
        (PLATFORM_GOOGLE_ADS, "Google Ads"),
        (PLATFORM_FACEBOOK, "Facebook"),
        (PLATFORM_AMAZON, "Amazon"),
        (PLATFORM_TIKTOK, "TikTok"),
        (PLATFORM_TWITCH, "Twitch"),
    ]

    STATUS_ACTIVE = "active"
    STATUS_PAUSED = "paused"

    STATUS_CHOICES = [
        (STATUS_ACTIVE, "Active"),
        (STATUS_PAUSED, "Paused"),
    ]

    account_name = models.CharField(max_length=50)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE
    )

    platform = models.CharField(max_length=50, choices=PLATFORMS)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="sources"
    )

    _access_token = models.TextField(
        max_length=255, blank=True, null=True, db_column="access_token"
    )
    _refresh_token = models.TextField(
        max_length=255, blank=True, null=True, db_column="refresh_token"
    )

    @property
    def access_token(self):
        return decrypt_token(self._access_token) if self._access_token else None

    @access_token.setter
    def access_token(self, value):
        self._access_token = encrypt_token(value) if value else None

    @property
    def refresh_token(self):
        return decrypt_token(self._refresh_token) if self._refresh_token else None

    @refresh_token.setter
    def refresh_token(self, value):
        self._refresh_token = encrypt_token(value) if value else None

    token_expires_at = models.DateTimeField(blank=True, null=True)
    last_fetched_at = models.DateTimeField(blank=True, null=True)
    channel_id = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = "source"
