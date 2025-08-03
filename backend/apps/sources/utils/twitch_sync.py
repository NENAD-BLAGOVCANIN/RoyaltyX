from datetime import date, timedelta
from django.utils import timezone
from apps.sources.models import Source
from apps.product.models import Product, ProductImpressions
from apps.sources.utils.twitch_service import TwitchService


def fetch_twitch_videos(source_id=None):
    sources = Source.objects.filter(
        platform=Source.PLATFORM_TWITCH, status=Source.STATUS_ACTIVE
    )
    if source_id:
        sources = sources.filter(id=source_id)

    for source in sources:
        # Refresh token if expired
        if source.token_expires_at and timezone.now() > source.token_expires_at:
            new_token = TwitchService.refresh_token(source.refresh_token)
            source.access_token = new_token
            source.save(update_fields=["_access_token"])

        if not source.access_token:
            print(f"No access token set for source {source.id}, skipping videos fetch")
            continue

        service = TwitchService(access_token=source.access_token)

        try:
            # Fetch both VODs
            videos = service.fetch_videos(user_id=source.channel_id)

            # Process VODs
            for video in videos:
                existing_product = Product.objects.filter(
                    external_id=video.get("id"),
                    project=source.project,
                ).first()

                if not existing_product:
                    thumbnail = None
                    raw_thumbnail_url = video.get("thumbnail_url", None)
                    if raw_thumbnail_url:
                        thumbnail = raw_thumbnail_url.replace(
                            "%{width}", "640"
                        ).replace("%{height}", "360")
                    Product.objects.create(
                        external_id=video.get("id", None),
                        title=video.get("title", None),
                        description=video.get("description", None),
                        thumbnail=thumbnail,
                        project=source.project,
                        source=source,
                    )

            source.last_fetched_at = timezone.now()
            source.save(update_fields=["last_fetched_at"])

        except Exception as e:
            print(f"Failed to fetch videos for source {source.id}: {e}")


def fetch_twitch_stats(source_id=None):
    sources = Source.objects.filter(
        platform=Source.PLATFORM_TWITCH, status=Source.STATUS_ACTIVE
    )
    if source_id:
        sources = sources.filter(id=source_id)

    start_date = date.today().isoformat()
    end_date = date.today().isoformat()

    for source in sources:
        # Refresh token if expired
        if source.token_expires_at and timezone.now() > source.token_expires_at:
            new_token = TwitchService.refresh_token(source.refresh_token)
            source.access_token = new_token
            source.save(update_fields=["_access_token"])

        if not source.access_token:
            print(f"No access token set for source {source.id}, skipping stats fetch")
            continue

        service = TwitchService(access_token=source.access_token)
        products = Product.objects.filter(source=source)

        for product in products:
            try:
                stats = service.fetch_video_stats(product.external_id)
                print(stats, flush=True)

                current_view_count = stats.get("view_count", 0) if stats else 0

                yesterday = date.today() - timedelta(days=1)
                yesterday_impressions = ProductImpressions.objects.filter(
                    product=product,
                    period_start=yesterday.isoformat(),
                    period_end=yesterday.isoformat(),
                ).first()

                yesterday_view_count = (
                    yesterday_impressions.impressions if yesterday_impressions else 0
                )

                # Calculate the actual view count for today (current - yesterday)
                views = max(0, current_view_count - yesterday_view_count)

                existing_stats = ProductImpressions.objects.filter(
                    product=product, period_start=start_date, period_end=end_date
                ).exists()

                if not existing_stats:
                    ProductImpressions.objects.create(
                        product=product,
                        impressions=views,
                        ecpm=0,
                        period_start=start_date,
                        period_end=end_date,
                    )

            except Exception as e:
                print(f"Failed to fetch stats for product {product.id}: {e}")
