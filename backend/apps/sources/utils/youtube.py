from datetime import date, timedelta

import requests
from django.conf import settings
from django.utils import timezone

from apps.product.models import Product, ProductImpressions
from apps.sources.models import Source


def request_users_youtube_content(access_token: str, channel_id: str) -> dict:
    """
    Fetch YouTube list of videos that this account owns.
    """
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "channelId": channel_id,
        "type": "video",
        "order": "date",
        "maxResults": 50,
    }
    headers = {"Authorization": f"Bearer {access_token}"}

    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 200:
        return response.json()
    else:
        response.raise_for_status()


def fetch_youtube_channel_details(access_token: str) -> dict:
    """
    Fetch the YouTube channel ID and name for the authenticated user.
    Returns a dict with 'id' and 'name' keys.
    """
    url = "https://www.googleapis.com/youtube/v3/channels"
    params = {
        "part": "id,snippet",
        "mine": "true",
    }
    headers = {"Authorization": f"Bearer {access_token}"}

    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 200:
        data = response.json()
        items = data.get("items", [])
        if items:
            channel = items[0]
            return {"id": channel["id"], "name": channel["snippet"]["title"]}
        else:
            raise ValueError("No YouTube channel found for this account")
    else:
        response.raise_for_status()


def fetch_youtube_channel_id(access_token: str) -> str:
    """
    Fetch the YouTube channel ID for the authenticated user.
    (Kept for backward compatibility)
    """
    channel_details = fetch_youtube_channel_details(access_token)
    return channel_details["id"]


def refresh_access_token(refresh_token: str) -> str:
    """
    Use the refresh token to get a new access token from Google.
    """
    url = "https://oauth2.googleapis.com/token"
    data = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token",
    }

    response = requests.post(url, data=data)

    if response.status_code == 200:
        return response.json().get("access_token")
    else:
        response.raise_for_status()


def fetch_youtube_videos(source_id=None):
    sources = Source.objects.filter(
        platform=Source.PLATFORM_YOUTUBE, status=Source.STATUS_ACTIVE
    )
    if source_id:
        sources = sources.filter(id=source_id)

    for source in sources:
        if source.token_expires_at and timezone.now() > source.token_expires_at:
            new_token = refresh_access_token(source.refresh_token)
            source.access_token = new_token
            source.save(update_fields=["_access_token"])

        if not source.channel_id:
            print(f"No channel_id set for source {source.id}, skipping video fetch")
            continue

        youtube_videos = request_users_youtube_content(
            access_token=source.access_token, channel_id=source.channel_id
        )
        for video in youtube_videos.get("items", []):
            existing_product = Product.objects.filter(
                title=video["snippet"]["title"],
                project=source.project,
            ).first()
            if not existing_product:
                Product.objects.create(
                    external_id=video["id"]["videoId"],
                    title=video["snippet"]["title"],
                    description=video["snippet"]["description"],
                    thumbnail=video["snippet"]["thumbnails"]
                    .get("high", {})
                    .get("url", video["snippet"]["thumbnails"]["default"]["url"]),
                    project=source.project,
                    source=source,
                )
        source.last_fetched_at = timezone.now()
        source.save(update_fields=["last_fetched_at"])


def fetch_youtube_stats(source_id=None):
    sources = Source.objects.filter(
        platform=Source.PLATFORM_YOUTUBE, status=Source.STATUS_ACTIVE
    )
    if source_id:
        sources = sources.filter(id=source_id)

    start_date = date.today().isoformat()
    end_date = date.today().isoformat()

    for source in sources:
        if source.token_expires_at and timezone.now() > source.token_expires_at:
            new_token = refresh_access_token(source.refresh_token)
            source.access_token = new_token
            source.save(update_fields=["_access_token"])

        if not source.channel_id:
            print(f"No channel_id set for source {source.id}, skipping stats fetch")
            continue

        products = Product.objects.filter(source=source)
        for product in products:
            stats = fetch_youtube_video_stats(product, source, start_date, end_date)
            print(stats, flush=True)
            rows = stats.get("rows", [])
            if rows:
                current_view_count = rows[0][0]
                print(f"Views: {current_view_count}")
            else:
                print("No rows returned in stats.")
                current_view_count = 0

            # Get yesterday's view count from ProductImpressions
            yesterday = date.today() - timedelta(days=1)
            yesterday_impressions = ProductImpressions.objects.filter(
                product=product,
                period_start=yesterday.isoformat(),
                period_end=yesterday.isoformat(),
            ).first()

            yesterday_views = (
                yesterday_impressions.impressions if yesterday_impressions else 0
            )

            # Calculate the actual view count for today (current - yesterday)
            views = current_view_count - yesterday_views

            existingProductImpressionsObjectWithSameDateRange = (
                ProductImpressions.objects.filter(
                    product=product, period_start=start_date, period_end=end_date
                )
            )

            if not existingProductImpressionsObjectWithSameDateRange:
                ProductImpressions.objects.create(
                    product=product,
                    impressions=views,
                    ecpm=0,
                    period_start=start_date,
                    period_end=end_date,
                )


def fetch_youtube_video_stats(product, source, start_date, end_date):
    """
    Gets Youtube Stats for the provided video
    """

    url = "https://youtubeanalytics.googleapis.com/v2/reports"

    params = {
        "ids": f"channel=={source.channel_id}",
        "startDate": start_date,
        "endDate": end_date,
        "metrics": "views",
        "filters": f"video=={product.external_id}",
    }
    headers = {"Authorization": f"Bearer {source.access_token}"}

    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 200:
        return response.json()
    else:
        response.raise_for_status()
