from django.urls import path

from .views import (
    change_password,
    change_subscription_plan,
    delete_account,
    get_available_plans,
    get_subscription_plan,
    get_users,
    getMyUserInfo,
)

urlpatterns = [
    path("", get_users, name="user.get_users"),
    path("get-my-info/", getMyUserInfo, name="user.getMyUserInfo"),
    path(
        "subscription-plan/", get_subscription_plan, name="user.get_subscription_plan"
    ),
    path(
        "subscription-plan/change/",
        change_subscription_plan,
        name="user.change_subscription_plan",
    ),
    path(
        "subscription-plan/available/",
        get_available_plans,
        name="user.get_available_plans",
    ),
    path("change-password/", change_password, name="user.change_password"),
    path("delete-account/", delete_account, name="user.delete_account"),
]
