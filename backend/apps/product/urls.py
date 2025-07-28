from django.urls import path

from .views import (
    ProductListCreateAPIView,
    getTopPerformingContentByImpressions,
    getTopPerformingContentBySales,
    product_detail,
)

urlpatterns = [
    path("", ProductListCreateAPIView.as_view(), name="product_list_create"),
    path("top-performing-by-impressions/", getTopPerformingContentByImpressions),
    path("top-performing-by-sales/", getTopPerformingContentBySales),
    path("<int:product_id>/", product_detail, name="product_detail"),
]
