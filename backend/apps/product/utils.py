from datetime import datetime, timedelta

from django.db.models import Count, ExpressionWrapper, F, FloatField, Sum
from django.db.models.functions import TruncMonth

from apps.product.models import ProductImpressions, ProductSale


def calculateProductAnalytics(product_id: int, filters: dict, months: int):
    now = datetime.now()
    impressions_qs = ProductImpressions.objects.filter(product_id=product_id)
    if filters:
        impressions_qs = impressions_qs.filter(**filters)

    # Monthly impressions and impression revenue
    monthly_impressions = (
        impressions_qs.annotate(month=TruncMonth("period_start"))
        .values("month")
        .annotate(impressions=Sum("impressions"))
        .order_by("month")
    )

    monthly_impression_revenue_qs = (
        impressions_qs.annotate(month=TruncMonth("period_start"))
        .annotate(
            revenue_expr=ExpressionWrapper(
                F("impressions") * F("ecpm") / 1000,
                output_field=FloatField(),
            )
        )
        .values("month")
        .annotate(impression_revenue=Sum("revenue_expr"))
        .order_by("month")
    )

    # Combine monthly stats
    impressions_map = {
        entry["month"]: entry["impressions"] or 0 for entry in monthly_impressions
    }
    impression_revenue_map = {
        entry["month"]: round(entry["impression_revenue"] or 0, 6)
        for entry in monthly_impression_revenue_qs
    }

    # Monthly royalty revenue from sales
    sales_qs = ProductSale.objects.filter(product_id=product_id)
    if filters:
        sales_qs = sales_qs.filter(**filters)

    monthly_revenue = (
        sales_qs.annotate(month=TruncMonth("period_start"))
        .values("month")
        .annotate(royalty_revenue=Sum("royalty_amount"))
        .order_by("month")
    )
    royalty_revenue_map = {
        entry["month"]: entry["royalty_revenue"] or 0 for entry in monthly_revenue
    }

    # Aggregate total number of sales per calendar month
    monthly_sales = (
        sales_qs.annotate(month=TruncMonth("period_start"))
        .values("month")
        .annotate(count=Count("id"))
        .order_by("month")
    )
    sales_map = {entry["month"]: entry["count"] for entry in monthly_sales}

    # Aggregate total number of rentals per calendar month
    monthly_rentals_qs = sales_qs.filter(type=ProductSale.TYPE_RENTAL)
    monthly_rentals = (
        monthly_rentals_qs.annotate(month=TruncMonth("period_start"))
        .values("month")
        .annotate(count=Count("id"))
        .order_by("month")
    )
    rentals_map = {entry["month"]: entry["count"] for entry in monthly_rentals}

    monthly_stats = []
    single_month_adjustment = False
    if months == 1:
        months += 1
        single_month_adjustment = True

    for i in range(months):
        if filters and filters["period_end__lte"]:
            month_date = (
                (filters["period_end__lte"].replace(day=1) - timedelta(days=i * 30))
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
                "impression_revenue": impression_revenue_map.get(month_date, 0),
                "royalty_revenue": royalty_revenue_map.get(month_date, 0),
            }
        )

    monthly_stats.reverse()

    # Total calculations
    total_impressions = (
        impressions_qs.aggregate(Sum("impressions"))["impressions__sum"] or 0
    )

    total_impression_revenue = (
        impressions_qs.annotate(
            revenue_expr=ExpressionWrapper(
                F("impressions") * F("ecpm") / 1000, output_field=FloatField()
            )
        ).aggregate(total=Sum("revenue_expr"))["total"]
        or 0
    )

    total_sales_count = sales_qs.count()

    total_royalty_revenue = (
        sales_qs.aggregate(Sum("royalty_amount"))["royalty_amount__sum"] or 0
    )

    rentals_qs = sales_qs.filter(type=ProductSale.TYPE_RENTAL)
    rentals_count = rentals_qs.count()
    rentals_revenue = (
        rentals_qs.aggregate(Sum("royalty_amount"))["royalty_amount__sum"] or 0
    )

    purchases_qs = sales_qs.filter(type=ProductSale.TYPE_PURCHASE)
    purchases_count = purchases_qs.count()
    purchases_revenue = (
        purchases_qs.aggregate(Sum("royalty_amount"))["royalty_amount__sum"] or 0
    )

    data = {
        "total_impressions": total_impressions,
        "impression_revenue": round(total_impression_revenue, 6),
        "total_sales_count": total_sales_count,
        "total_royalty_revenue": total_royalty_revenue,
        "rentals_count": rentals_count,
        "rentals_revenue": rentals_revenue,
        "purchases_count": purchases_count,
        "purchases_revenue": purchases_revenue,
        "monthly_stats": monthly_stats,
    }

    return data
