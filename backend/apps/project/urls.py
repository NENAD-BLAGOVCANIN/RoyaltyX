from django.urls import path

from .views import (
    MyProjectsView,
    ProjectDetailView,
    ProjectListCreateView,
    ProjectProductsView,
    ProjectUserListView,
    ProjectUserView,
    ProjectUserUpdateView,
    ProducerProductAccessView,
    SwitchProjectView,
    deleteProject,
    updateProject,
)

urlpatterns = [
    path("", ProjectListCreateView.as_view(), name="project-list-create"),
    path("info/", ProjectDetailView.as_view(), name="project-detail"),
    path("update/", updateProject),
    path("users/", ProjectUserListView.as_view(), name="project-user-list"),
    path("users/<int:id>", ProjectUserView.as_view(), name="project-user"),
    path("users/<int:id>/update/", ProjectUserUpdateView.as_view(), name="project-user-update"),
    path("products/", ProjectProductsView.as_view(), name="project-products"),
    path("producer-access/", ProducerProductAccessView.as_view(), name="producer-product-access"),
    path("my-projects/", MyProjectsView.as_view(), name="my-projects"),
    path("switch-project/", SwitchProjectView.as_view(), name="switch-project"),
    path("delete/", deleteProject),
]
