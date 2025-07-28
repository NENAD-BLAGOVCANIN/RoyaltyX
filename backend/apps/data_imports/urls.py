from django.urls import path

from .views import FileDetailView, FileListCreateView

urlpatterns = [
    path("files/", FileListCreateView.as_view(), name="file-list-create"),
    path("files/<int:pk>/", FileDetailView.as_view(), name="file-detail"),
]
