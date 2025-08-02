from django.urls import path

from .views import FileDetailView, FileListCreateView, ColumnMappingView, ExpectedFieldsView

urlpatterns = [
    path("files/", FileListCreateView.as_view(), name="file-list-create"),
    path("files/<int:pk>/", FileDetailView.as_view(), name="file-detail"),
    path("files/<int:file_id>/confirm-mappings/", ColumnMappingView.as_view(), name="confirm-column-mappings"),
    path("expected-fields/", ExpectedFieldsView.as_view(), name="expected-fields"),
]
