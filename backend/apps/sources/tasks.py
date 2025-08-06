from celery import shared_task

from apps.sources.utils.tiktok_sync import fetch_tiktok_stats, fetch_tiktok_videos
from apps.sources.utils.twitch_sync import fetch_twitch_stats, fetch_twitch_videos
from apps.sources.utils.vimeo_sync import fetch_vimeo_videos_and_stats
from apps.sources.utils.youtube import fetch_youtube_stats, fetch_youtube_videos


@shared_task
def task_fetch_youtube_videos():
    print("Running task for fetching YouTube videos.", flush=True)
    fetch_youtube_videos()


@shared_task
def task_fetch_youtube_stats():
    print("Running task for fetching YouTube stats.", flush=True)
    fetch_youtube_stats()

@shared_task
def task_fetch_tiktok_videos():
    print("Running task for fetching TikTok videos.", flush=True)
    fetch_tiktok_videos()


@shared_task
def task_fetch_tiktok_stats():
    print("Running task for fetching TikTok stats.", flush=True)
    fetch_tiktok_stats()


@shared_task
def task_fetch_twitch_videos():
    print("Running task for fetching Twitch videos.", flush=True)
    fetch_twitch_videos()


@shared_task
def task_fetch_twitch_stats():
    print("Running task for fetching Twitch stats.", flush=True)
    fetch_twitch_stats()

@shared_task
def task_fetch_vimeo_videos_and_stats():
    print("Running task for fetching Vimeo videos and stats.", flush=True)
    fetch_vimeo_videos_and_stats()
