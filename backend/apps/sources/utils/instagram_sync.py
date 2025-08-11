from datetime import date, timedelta
from django.utils import timezone
from apps.sources.models import Source
from apps.product.models import Product, ProductImpressions
from apps.sources.utils.instagram_service import InstagramService


def extract_title_from_caption(caption: str, word_count: int = 3) -> str:
    if not caption:
        return None
    words = caption.strip().split()
    if len(words) <= word_count:
        return " ".join(words)
    else:
        return " ".join(words[:word_count]) + "..."


def fetch_instagram_videos(source_id=None):
    sources = Source.objects.filter(
        platform=Source.PLATFORM_INSTAGRAM, status=Source.STATUS_ACTIVE
    )
    if source_id:
        sources = sources.filter(id=source_id)

    for source in sources:
        # Refresh token if expired
        if source.token_expires_at and timezone.now() > source.token_expires_at:
            response = InstagramService.refresh_token(source.access_token)
            source.access_token = response["access_token"]
            expires_in_seconds = response["expires_in"]
            expiry_datetime = timezone.now() + timedelta(seconds=expires_in_seconds)
            source.token_expires_at = expiry_datetime            
            source.save(update_fields=["_access_token", "token_expires_at"])

        if not source.access_token:
            print(f"No access token set for source {source.id}, skipping videos fetch")
            continue

        service = InstagramService(access_token=source.access_token)

        try:
            videos = service.fetch_media()
            for video in videos:
                media_type = video.get("media_type", None)
                if media_type == "VIDEO": # SKIP OTHER MEDIA TYPES 
                    existing_product = Product.objects.filter(
                        external_id=video.get("id"),
                        project=source.project,
                    ).first()

                    if not existing_product:
                        Product.objects.create(
                            external_id=video.get("id", None),
                            title=extract_title_from_caption(video.get("caption", None)),
                            description=video.get("caption", None),
                            thumbnail=video.get("thumbnail_url", None),
                            project=source.project,
                            source=source,
                        )

            source.last_fetched_at = timezone.now()
            source.save(update_fields=["last_fetched_at"])

        except Exception as e:
            print(f"Failed to fetch videos for source {source.id}: {e}")


def fetch_instagram_stats(source_id=None):
    sources = Source.objects.filter(
        platform=Source.PLATFORM_INSTAGRAM, status=Source.STATUS_ACTIVE
    )
    if source_id:
        sources = sources.filter(id=source_id)

    start_date = date.today().isoformat()
    end_date = date.today().isoformat()

    for source in sources:
        # Refresh token if expired
        if source.token_expires_at and timezone.now() > source.token_expires_at:
            response = InstagramService.refresh_token(source.access_token)
            source.access_token = response["access_token"]
            expires_in_seconds = response["expires_in"]
            expiry_datetime = timezone.now() + timedelta(seconds=expires_in_seconds)
            source.token_expires_at = expiry_datetime            
            source.save(update_fields=["_access_token", "token_expires_at"])

        if not source.access_token:
            print(f"No access token set for source {source.id}, skipping stats fetch")
            continue

        service = InstagramService(access_token=source.access_token)
        products = Product.objects.filter(source=source)

        for product in products:
            try:
                stats_list = service.fetch_insights(product.external_id)
                stats = stats_list[0] if stats_list else None
                print(stats, flush=True)
                if stats and stats.get("name") == "views":
                    current_view_count = stats["values"][0]["value"]
                else:
                    current_view_count = 0

                # Get yesterday's view count from ProductImpressions
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
                views = current_view_count - yesterday_view_count

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
