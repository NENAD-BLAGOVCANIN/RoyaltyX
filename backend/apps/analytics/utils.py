from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional, Union

from django.db.models import Count, DecimalField, ExpressionWrapper, F, QuerySet, Sum
from django.db.models.functions import TruncYear, TruncMonth, TruncDate, TruncHour

from apps.product.models import Product, ProductImpressions, ProductSale
from apps.sources.models import Source


def calculate_yearly_stats(
    impressions_qs: QuerySet,
    sales_qs: QuerySet,
    years: int,
    period_end: Optional[date],
) -> List[Dict[str, Any]]:
    now = datetime.now()

    # Yearly impressions
    yearly_impressions = (
        impressions_qs.annotate(year=TruncYear("period_start"))
        .values("year")
        .annotate(impressions=Sum("impressions"))
        .order_by("year")
    )

    # Yearly impression revenue
    impression_revenue_qs = (
        impressions_qs.annotate(year=TruncYear("period_start"))
        .annotate(
            revenue_expr=ExpressionWrapper(
                F("impressions") * F("ecpm") / 1000,
                output_field=DecimalField(max_digits=30, decimal_places=18),
            )
        )
        .values("year")
        .annotate(impression_revenue=Sum("revenue_expr"))
        .order_by("year")
    )

    # Yearly royalty revenue
    yearly_revenue = (
        sales_qs.annotate(year=TruncYear("period_start"))
        .values("year")
        .annotate(royalty_revenue=Sum("royalty_amount"))
        .order_by("year")
    )

    # Yearly sales count
    yearly_sales = (
        sales_qs.annotate(year=TruncYear("period_start"))
        .values("year")
        .annotate(count=Count("id"))
        .order_by("year")
    )

    # Yearly rentals
    yearly_rentals_qs = sales_qs.filter(type=ProductSale.TYPE_RENTAL)
    yearly_rentals = (
        yearly_rentals_qs.annotate(year=TruncYear("period_start"))
        .values("year")
        .annotate(count=Count("id"))
        .order_by("year")
    )

    # Map results by year
    impressions_map = {
        entry["year"]: entry["impressions"] or 0 for entry in yearly_impressions
    }
    impression_revenue_map = {
        entry["year"]: round(entry["impression_revenue"] or 0, 6)
        for entry in impression_revenue_qs
    }
    royalty_revenue_map = {
        entry["year"]: entry["royalty_revenue"] or 0 for entry in yearly_revenue
    }
    sales_map = {entry["year"]: entry["count"] for entry in yearly_sales}
    rentals_map = {entry["year"]: entry["count"] for entry in yearly_rentals}

    yearly_stats = []

    for i in range(years):
        if period_end:
            year_date = (
                (period_end.replace(month=1, day=1) - timedelta(days=i * 365))
                .replace(month=1, day=1)
                .date()
            )
        else:
            year_date = (
                (now.replace(month=1, day=1) - timedelta(days=i * 365))
                .replace(month=1, day=1)
                .date()
            )

        yearly_stats.append(
            {
                "year": year_date.strftime("%Y"),
                "impressions": impressions_map.get(year_date, 0),
                "sales": sales_map.get(year_date, 0),
                "rentals": rentals_map.get(year_date, 0),
                "royalty_revenue": royalty_revenue_map.get(year_date, 0),
                "impression_revenue": impression_revenue_map.get(year_date, 0),
            }
        )

    yearly_stats.reverse()
    return yearly_stats


def calculate_monthly_stats(
    impressions_qs: QuerySet,
    sales_qs: QuerySet,
    months: int,
    period_end: Optional[date],
) -> List[Dict[str, Any]]:
    now = datetime.now()

    # Monthly impressions
    monthly_impressions = (
        impressions_qs.annotate(month=TruncMonth("period_start"))
        .values("month")
        .annotate(impressions=Sum("impressions"))
        .order_by("month")
    )

    # Monthly impression revenue
    impression_revenue_qs = (
        impressions_qs.annotate(month=TruncMonth("period_start"))
        .annotate(
            revenue_expr=ExpressionWrapper(
                F("impressions") * F("ecpm") / 1000,
                output_field=DecimalField(max_digits=30, decimal_places=18),
            )
        )
        .values("month")
        .annotate(impression_revenue=Sum("revenue_expr"))
        .order_by("month")
    )

    # Monthly royalty revenue
    monthly_revenue = (
        sales_qs.annotate(month=TruncMonth("period_start"))
        .values("month")
        .annotate(royalty_revenue=Sum("royalty_amount"))
        .order_by("month")
    )

    # Monthly sales count
    monthly_sales = (
        sales_qs.annotate(month=TruncMonth("period_start"))
        .values("month")
        .annotate(count=Count("id"))
        .order_by("month")
    )

    # Monthly rentals
    monthly_rentals_qs = sales_qs.filter(type=ProductSale.TYPE_RENTAL)
    monthly_rentals = (
        monthly_rentals_qs.annotate(month=TruncMonth("period_start"))
        .values("month")
        .annotate(count=Count("id"))
        .order_by("month")
    )

    # Map results by month
    impressions_map = {
        entry["month"]: entry["impressions"] or 0 for entry in monthly_impressions
    }
    impression_revenue_map = {
        entry["month"]: round(entry["impression_revenue"] or 0, 6)
        for entry in impression_revenue_qs
    }
    royalty_revenue_map = {
        entry["month"]: entry["royalty_revenue"] or 0 for entry in monthly_revenue
    }
    sales_map = {entry["month"]: entry["count"] for entry in monthly_sales}
    rentals_map = {entry["month"]: entry["count"] for entry in monthly_rentals}

    monthly_stats = []
    single_month_adjustment = False
    if months == 1:
        months += 1
        single_month_adjustment = True

    for i in range(months):
        if period_end:
            month_date = (
                (period_end.replace(day=1) - timedelta(days=i * 30))
                .replace(day=1)
                .date()
            )
        else:
            month_date = (now.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
            month_date = month_date.date().replace(day=1)

        if single_month_adjustment:
            month_date = (month_date + timedelta(days=31)).replace(day=1)

        monthly_stats.append(
            {
                "month": month_date.strftime("%Y-%m"),
                "impressions": impressions_map.get(month_date, 0),
                "sales": sales_map.get(month_date, 0),
                "rentals": rentals_map.get(month_date, 0),
                "royalty_revenue": royalty_revenue_map.get(month_date, 0),
                "impression_revenue": impression_revenue_map.get(month_date, 0),
            }
        )

    monthly_stats.reverse()
    return monthly_stats


def calculate_daily_stats(
    impressions_qs: QuerySet,
    sales_qs: QuerySet,
    period_start: date,
    period_end: date,
) -> List[Dict[str, Any]]:
    # Daily impressions
    daily_impressions = (
        impressions_qs.annotate(day=TruncDate("period_start"))
        .values("day")
        .annotate(impressions=Sum("impressions"))
        .order_by("day")
    )

    # Daily impression revenue
    impression_revenue_qs = (
        impressions_qs.annotate(day=TruncDate("period_start"))
        .annotate(
            revenue_expr=ExpressionWrapper(
                F("impressions") * F("ecpm") / 1000,
                output_field=DecimalField(max_digits=30, decimal_places=18),
            )
        )
        .values("day")
        .annotate(impression_revenue=Sum("revenue_expr"))
        .order_by("day")
    )

    # Daily royalty revenue
    daily_revenue = (
        sales_qs.annotate(day=TruncDate("period_start"))
        .values("day")
        .annotate(royalty_revenue=Sum("royalty_amount"))
        .order_by("day")
    )

    # Daily sales count
    daily_sales = (
        sales_qs.annotate(day=TruncDate("period_start"))
        .values("day")
        .annotate(count=Count("id"))
        .order_by("day")
    )

    # Daily rentals
    daily_rentals_qs = sales_qs.filter(type=ProductSale.TYPE_RENTAL)
    daily_rentals = (
        daily_rentals_qs.annotate(day=TruncDate("period_start"))
        .values("day")
        .annotate(count=Count("id"))
        .order_by("day")
    )

    # Map results by day
    impressions_map = {
        entry["day"]: entry["impressions"] or 0 for entry in daily_impressions
    }
    impression_revenue_map = {
        entry["day"]: round(entry["impression_revenue"] or 0, 6)
        for entry in impression_revenue_qs
    }
    royalty_revenue_map = {
        entry["day"]: entry["royalty_revenue"] or 0 for entry in daily_revenue
    }
    sales_map = {entry["day"]: entry["count"] for entry in daily_sales}
    rentals_map = {entry["day"]: entry["count"] for entry in daily_rentals}

    daily_stats = []
    current_date = period_start

    while current_date <= period_end:
        daily_stats.append(
            {
                "period": current_date.strftime("%Y-%m-%d"),
                "impressions": impressions_map.get(current_date, 0),
                "sales": sales_map.get(current_date, 0),
                "rentals": rentals_map.get(current_date, 0),
                "royalty_revenue": royalty_revenue_map.get(current_date, 0),
                "impression_revenue": impression_revenue_map.get(current_date, 0),
            }
        )
        current_date += timedelta(days=1)

    return daily_stats


def calculate_hourly_stats(
    impressions_qs: QuerySet,
    sales_qs: QuerySet,
    period_start: datetime,
    period_end: datetime,
) -> List[Dict[str, Any]]:
    # Hourly impressions
    hourly_impressions = (
        impressions_qs.annotate(hour=TruncHour("period_start"))
        .values("hour")
        .annotate(impressions=Sum("impressions"))
        .order_by("hour")
    )

    # Hourly impression revenue
    impression_revenue_qs = (
        impressions_qs.annotate(hour=TruncHour("period_start"))
        .annotate(
            revenue_expr=ExpressionWrapper(
                F("impressions") * F("ecpm") / 1000,
                output_field=DecimalField(max_digits=30, decimal_places=18),
            )
        )
        .values("hour")
        .annotate(impression_revenue=Sum("revenue_expr"))
        .order_by("hour")
    )

    # Hourly royalty revenue
    hourly_revenue = (
        sales_qs.annotate(hour=TruncHour("period_start"))
        .values("hour")
        .annotate(royalty_revenue=Sum("royalty_amount"))
        .order_by("hour")
    )

    # Hourly sales count
    hourly_sales = (
        sales_qs.annotate(hour=TruncHour("period_start"))
        .values("hour")
        .annotate(count=Count("id"))
        .order_by("hour")
    )

    # Hourly rentals
    hourly_rentals_qs = sales_qs.filter(type=ProductSale.TYPE_RENTAL)
    hourly_rentals = (
        hourly_rentals_qs.annotate(hour=TruncHour("period_start"))
        .values("hour")
        .annotate(count=Count("id"))
        .order_by("hour")
    )

    # Map results by hour
    impressions_map = {
        entry["hour"]: entry["impressions"] or 0 for entry in hourly_impressions
    }
    impression_revenue_map = {
        entry["hour"]: round(entry["impression_revenue"] or 0, 6)
        for entry in impression_revenue_qs
    }
    royalty_revenue_map = {
        entry["hour"]: entry["royalty_revenue"] or 0 for entry in hourly_revenue
    }
    sales_map = {entry["hour"]: entry["count"] for entry in hourly_sales}
    rentals_map = {entry["hour"]: entry["count"] for entry in hourly_rentals}

    hourly_stats = []
    current_hour = period_start.replace(minute=0, second=0, microsecond=0)

    while current_hour <= period_end:
        hourly_stats.append(
            {
                "period": current_hour.strftime("%Y-%m-%d %H:00"),
                "impressions": impressions_map.get(current_hour, 0),
                "sales": sales_map.get(current_hour, 0),
                "rentals": rentals_map.get(current_hour, 0),
                "royalty_revenue": royalty_revenue_map.get(current_hour, 0),
                "impression_revenue": impression_revenue_map.get(current_hour, 0),
            }
        )
        current_hour += timedelta(hours=1)

    return hourly_stats


def calculate_totals(
    impressions_qs: QuerySet, sales_qs: QuerySet
) -> Dict[str, Union[int, float]]:
    # Total calculations
    total_impressions = (
        impressions_qs.aggregate(Sum("impressions"))["impressions__sum"] or 0
    )

    total_impression_revenue = (
        impressions_qs.annotate(
            revenue_expr=ExpressionWrapper(
                F("impressions") * F("ecpm") / 1000,
                output_field=DecimalField(max_digits=30, decimal_places=18),
            )
        ).aggregate(total=Sum("revenue_expr"))["total"]
        or 0
    )

    total_sales_count = sales_qs.count()
    total_royalty_revenue = (
        sales_qs.aggregate(total_revenue=Sum("royalty_amount"))["total_revenue"] or 0
    )

    rentals_qs = sales_qs.filter(type=ProductSale.TYPE_RENTAL)
    rentals_count = rentals_qs.count()
    rentals_revenue = (
        rentals_qs.aggregate(total_rentals_revenue=Sum("royalty_amount"))[
            "total_rentals_revenue"
        ]
        or 0
    )

    purchases_qs = sales_qs.filter(type=ProductSale.TYPE_PURCHASE)
    purchases_count = purchases_qs.count()
    purchases_revenue = (
        purchases_qs.aggregate(total_purchases_revenue=Sum("royalty_amount"))[
            "total_purchases_revenue"
        ]
        or 0
    )

    data = {
        "total_impressions": total_impressions,
        "total_sales_count": total_sales_count,
        "total_royalty_revenue": total_royalty_revenue,
        "rentals_count": rentals_count,
        "rentals_revenue": rentals_revenue,
        "purchases_count": purchases_count,
        "purchases_revenue": purchases_revenue,
        "total_impression_revenue": total_impression_revenue,
    }

    return data


def calculate_analytics_per_source(
    project_id: int,
    impressions_qs: QuerySet,
    sales_qs: QuerySet,
) -> List[Dict[str, Any]]:
    """
    Calculate analytics per source, returning source information along with impressions and sales data.
    """
    # Get all sources for the project
    sources = Source.objects.filter(project_id=project_id)

    source_analytics = []

    for source in sources:
        # Get impressions and sales for this source
        impressions_qs = impressions_qs.filter(
            product__source_id=source.id,
        )
        sales_qs = sales_qs.filter(
            product__source_id=source.id,
        )

        # Calculate totals for this source
        total_impressions = (
            impressions_qs.aggregate(total=Sum("impressions"))["total"] or 0
        )

        total_impression_revenue = (
            impressions_qs.annotate(
                revenue_expr=ExpressionWrapper(
                    F("impressions") * F("ecpm") / 1000,
                    output_field=DecimalField(max_digits=30, decimal_places=18),
                )
            ).aggregate(total=Sum("revenue_expr"))["total"]
            or 0
        )

        total_sales_count = sales_qs.count()
        total_royalty_revenue = (
            sales_qs.aggregate(total=Sum("royalty_amount"))["total"] or 0
        )

        # Calculate rentals and purchases separately
        rentals_qs = sales_qs.filter(type=ProductSale.TYPE_RENTAL)
        rentals_count = rentals_qs.count()
        rentals_revenue = (
            rentals_qs.aggregate(total=Sum("royalty_amount"))["total"] or 0
        )

        purchases_qs = sales_qs.filter(type=ProductSale.TYPE_PURCHASE)
        purchases_count = purchases_qs.count()
        purchases_revenue = (
            purchases_qs.aggregate(total=Sum("royalty_amount"))["total"] or 0
        )

        # Get product count for this source
        product_count = Product.objects.filter(
            source_id=source.id, project_id=project_id
        ).count()

        # Compile source analytics data
        source_data = {
            "id": source.id,
            "account_name": source.account_name,
            "platform": source.platform,
            "platform_display": source.get_platform_display(),
            "analytics": {
                "total_impressions": total_impressions,
                "total_impression_revenue": round(float(total_impression_revenue), 6),
                "total_sales_count": total_sales_count,
                "total_royalty_revenue": float(total_royalty_revenue),
                "rentals_count": rentals_count,
                "rentals_revenue": float(rentals_revenue),
                "purchases_count": purchases_count,
                "purchases_revenue": float(purchases_revenue),
                "product_count": product_count,
            },
        }

        source_analytics.append(source_data)

    # Sort by total revenue (impression + royalty) descending
    source_analytics.sort(
        key=lambda x: x["analytics"]["total_impression_revenue"]
        + x["analytics"]["total_royalty_revenue"],
        reverse=True,
    )

    return source_analytics


def calculate_analytics(
    project_id: int,
    filters: Dict[str, Any],
    period_start: date,
    period_end: date,
    product_id: int = None,
    granularity: str = "monthly",
) -> Dict[str, Any]:
    if product_id:
        impressions_qs = ProductImpressions.objects.filter(product_id=product_id)
        sales_qs = ProductSale.objects.filter(product_id=product_id)
    else:
        impressions_qs = ProductImpressions.objects.filter(
            product__project_id=project_id
        )
        sales_qs = ProductSale.objects.filter(product__project_id=project_id)

    if filters:
        impressions_qs = impressions_qs.filter(**filters)
        sales_qs = sales_qs.filter(**filters)

    # Calculate time-based stats based on granularity
    if granularity == "daily":
        if period_start and period_end:
            time_stats = calculate_daily_stats(
                impressions_qs, sales_qs, period_start, period_end
            )
    elif granularity == "hourly": # Currently unused; enable this in the view when ready
        period_start_time = filters.get("period_start__gte")
        period_end_time = filters.get("period_end__lte")
        if period_start_time and period_end_time:
            time_stats = calculate_hourly_stats(
                impressions_qs, sales_qs, period_start_time, period_end_time
            )
    elif granularity == "monthly": 
        months = 12
        if period_start and period_end:
            months = (
                (period_end.year - period_start.year) * 12
                + (period_end.month - period_start.month)
                + 1
            )
        time_stats = calculate_monthly_stats(
            impressions_qs, sales_qs, months, filters.get("period_end__lte")
        )
    elif granularity == "yearly": 
        years = 5
        if period_start and period_end:
            years = period_end.year - period_start.year + 1
        time_stats = calculate_yearly_stats(
            impressions_qs, sales_qs, years, filters.get("period_end__lte")
        )

    else:
        # Find the earliest data point to determine the full range
        earliest_impression = impressions_qs.order_by('period_start').first()
        earliest_sale = sales_qs.order_by('period_start').first()
        
        earliest_date = None
        if earliest_impression and earliest_sale:
            earliest_date = min(earliest_impression.period_start, earliest_sale.period_start)
        elif earliest_impression:
            earliest_date = earliest_impression.period_start
        elif earliest_sale:
            earliest_date = earliest_sale.period_start
        
        if earliest_date:
            from datetime import datetime
            current_date = datetime.now().date()
            months = (current_date.year - earliest_date.year) * 12 + (current_date.month - earliest_date.month) + 1
            years = current_date.year - earliest_date.year + 1
        else:
            # Fallback to 1 year if no data exists
            years = 1
            months = 12
        
        # If only 1-2 year of data, switch to monthly granularity for better visualization
        if years <= 2:
            time_stats = calculate_monthly_stats(
                impressions_qs, sales_qs, months, None
            )
            granularity = "monthly"
        else:
            time_stats = calculate_yearly_stats(
                impressions_qs, sales_qs, years, None
            )
            granularity = "yearly"

    data = calculate_totals(impressions_qs, sales_qs)

    data["time_stats"] = time_stats

    # Include granularity information in response
    data["granularity"] = granularity

    if not product_id:
        source_analytics = calculate_analytics_per_source(
            project_id, impressions_qs, sales_qs
        )
        data["source_analytics"] = source_analytics
        # Only include product count for full project analytics
        data["product_count"] = Product.objects.filter(project_id=project_id).count()

    return data
