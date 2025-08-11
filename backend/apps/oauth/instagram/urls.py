from django.urls import path

from .views import (
    InstagramTokenExchange,
)

urlpatterns = [
    path(
        "exchange/",
        InstagramTokenExchange.as_view(),
    ),
]
