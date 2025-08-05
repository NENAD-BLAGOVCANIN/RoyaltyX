from django.urls import path

from .views import (
    VimeoTokenExchange,
)

urlpatterns = [
    path(
        "exchange/",
        VimeoTokenExchange.as_view(),
    ),
]
