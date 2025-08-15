from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("authentication/", include("apps.authentication.urls")),
    path("users/", include("apps.user.urls")),
    path("projects/", include("apps.project.urls")),
    path("data_imports/", include("apps.data_imports.urls")),
    path("products/", include("apps.product.urls")),
    path("reports/", include("apps.report.urls")),
    path("analytics/", include("apps.analytics.urls")),
    path("notifications/", include("apps.notifications.urls")),
    path("support/", include("apps.support.urls")),
    path("sources/", include("apps.sources.urls")),
    path("admin-panel/", include("apps.admin_panel.urls")),
    path("payments/", include("apps.payments.urls")),
    path("invites/", include("apps.invites.urls")),
    ## OAuth2
    path("oauth/google/", include("apps.oauth.google.urls")),
    path("oauth/tiktok/", include("apps.oauth.tiktok.urls")),
    path("oauth/twitch/", include("apps.oauth.twitch.urls")),
    path("oauth/vimeo/", include("apps.oauth.vimeo.urls")),
    path("oauth/instagram/", include("apps.oauth.instagram.urls")),
    ## API documentation urls
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path("docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
