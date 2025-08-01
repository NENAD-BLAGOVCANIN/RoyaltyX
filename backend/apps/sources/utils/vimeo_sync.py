from datetime import date, timedelta
from django.utils import timezone
from apps.sources.models import Source
from apps.product.models import Product, ProductImpressions
from apps.sources.utils.vimeo_service import VimeoService


def fetch_vimeo_videos_and_stats(source_id=None):
    sources = Source.objects.filter(platform=Source.PLATFORM_VIMEO)
    if source_id:
        sources = sources.filter(id=source_id)
    
    for source in sources:
        if not source.access_token:
            print(f"No access token set for source {source.id}, skipping videos fetch")
            continue

        start_date = date.today().isoformat()
        end_date = date.today().isoformat()
        service = VimeoService(access_token=source.access_token)

        try:
            videos = service.fetch_videos()
            print(videos, flush=True)
            # Process VODs
            for video in videos:
                product = Product.objects.filter(
                    external_id=video.get("id"),
                    project=source.project,
                ).first()
                if not product:
                    product = Product.objects.create(
                        external_id=video.get("id", None),
                        title=video.get("title", None),
                        description=video.get("description", None),
                        thumbnail=video.get("thumbnail_url", None),
                        project=source.project,
                        source=source,
                    )
                
                # Process stats
                current_view_count = video.get("view_count", 0)
                
                yesterday = date.today() - timedelta(days=1)
                yesterday_impressions = ProductImpressions.objects.filter(
                    product=product,
                    period_start=yesterday.isoformat(),
                    period_end=yesterday.isoformat()
                ).first()
                
                yesterday_view_count = yesterday_impressions.impressions if yesterday_impressions else 0
                
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
                

                    
            source.last_fetched_at = timezone.now()
            source.save(update_fields=["last_fetched_at"])

        except Exception as e:
            print(f"Failed to fetch videos for source {source.id}: {e}")
