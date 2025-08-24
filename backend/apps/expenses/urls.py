from django.urls import path

from .views import (
    ExpenseDetailView,
    ExpenseListCreateView,
    ProjectMembersView,
    ProjectProductsView,
)

urlpatterns = [
    path("", ExpenseListCreateView.as_view(), name="expense-list-create"),
    path("<int:pk>/", ExpenseDetailView.as_view(), name="expense-detail"),
    path("members/", ProjectMembersView.as_view(), name="project-members"),
    path("products/", ProjectProductsView.as_view(), name="project-products"),
]
