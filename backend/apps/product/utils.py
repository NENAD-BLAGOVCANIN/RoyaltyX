from django.db.models import Sum

from apps.product.models import ProductImpressions, ProductSale


def calculateProductAnalytics(product_id: int, filters: dict):
    impressions_qs = ProductImpressions.objects.filter(product_id=product_id)
    if filters:
        impressions_qs = impressions_qs.filter(**filters)
    total_impressions = (
        impressions_qs.aggregate(Sum("impressions"))["impressions__sum"] or 0
    )

    sales_qs = ProductSale.objects.filter(product_id=product_id)
    if filters:
        sales_qs = sales_qs.filter(**filters)
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
    }

    return data
