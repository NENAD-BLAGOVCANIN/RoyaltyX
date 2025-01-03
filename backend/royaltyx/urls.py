from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('authentication/', include('apps.authentication.urls')),
    path('users/', include('apps.user.urls')),
    path('projects/', include('apps.project.urls')),
]
