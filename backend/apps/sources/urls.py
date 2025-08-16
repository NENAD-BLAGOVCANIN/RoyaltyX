from django.urls import path

from .views import (
    SourceDetailView,
    SourceListCreateView,
    UserProjectRoleView,
)

urlpatterns = [
    path("", SourceListCreateView.as_view()),
    path("user-role/", UserProjectRoleView.as_view()),
    path("<int:pk>/", SourceDetailView.as_view()),
]
