from django.contrib.auth import get_user_model
from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from apps.project.models import Project
from apps.sources.models import Source

User = get_user_model()


class UsersPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def admin_dashboard_stats(request):
    """
    Get comprehensive dashboard statistics for admin panel
    """
    if not hasattr(request.user, "role") or request.user.role != "admin":
        return Response(
            {"error": "You do not have permission to perform this action."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Total counts
    total_users = User.objects.filter(is_deleted=False).count()
    total_projects = Project.objects.count()
    total_sources = Source.objects.count()

    # Users per month for the last 12 months
    twelve_months_ago = timezone.now() - timezone.timedelta(days=365)
    users_per_month = (
        User.objects.filter(date_joined__gte=twelve_months_ago, is_deleted=False)
        .annotate(month=TruncMonth("date_joined"))
        .values("month")
        .annotate(count=Count("id"))
        .order_by("month")
    )

    # Format users per month data for frontend chart
    users_growth_data = []
    for entry in users_per_month:
        users_growth_data.append(
            {
                "month": entry["month"].strftime("%Y-%m"),
                "count": entry["count"],
                "month_name": entry["month"].strftime("%B %Y"),
            }
        )

    # Recent activity stats
    last_30_days = timezone.now() - timezone.timedelta(days=30)
    new_users_last_30_days = User.objects.filter(
        date_joined__gte=last_30_days, is_deleted=False
    ).count()
    new_projects_last_30_days = Project.objects.filter(
        created_at__gte=last_30_days
    ).count()
    new_sources_last_30_days = Source.objects.filter(
        created_at__gte=last_30_days
    ).count()

    stats = {
        "total_users": total_users,
        "total_projects": total_projects,
        "total_sources": total_sources,
        "users_growth_data": users_growth_data,
        "recent_activity": {
            "new_users_last_30_days": new_users_last_30_days,
            "new_projects_last_30_days": new_projects_last_30_days,
            "new_sources_last_30_days": new_sources_last_30_days,
        },
    }

    return Response(stats)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def users_list(request):
    """
    Get paginated list of all users
    """
    if not hasattr(request.user, "role") or request.user.role != "admin":
        return Response(
            {"error": "You do not have permission to perform this action."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Get all users ordered by date joined (newest first)
    users = User.objects.all().order_by("-date_joined")

    # Apply pagination
    paginator = UsersPagination()
    paginated_users = paginator.paginate_queryset(users, request)

    # Serialize user data
    users_data = []
    for user in paginated_users:
        users_data.append(
            {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "username": user.username,
                "role": user.role,
                "is_active": user.is_active,
                "is_email_verified": user.is_email_verified,
                "date_joined": user.date_joined,
                "last_login": user.last_login,
                "avatar": user.avatar,
            }
        )

    return paginator.get_paginated_response(users_data)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def users_stats(request):
    """
    Get detailed user statistics
    """
    if not hasattr(request.user, "role") or request.user.role != "admin":
        return Response(
            {"error": "You do not have permission to perform this action."},
            status=status.HTTP_403_FORBIDDEN,
        )

    total_users = User.objects.filter(is_deleted=False).count()
    admin_users = User.objects.filter(role="admin", is_deleted=False).count()
    regular_users = User.objects.filter(role="user", is_deleted=False).count()

    # Active users (logged in within last 30 days)
    last_30_days = timezone.now() - timezone.timedelta(days=30)
    active_users = User.objects.filter(
        last_login__gte=last_30_days, is_deleted=False
    ).count()

    stats = {
        "total_users": total_users,
        "admin_users": admin_users,
        "regular_users": regular_users,
        "active_users": active_users,
    }

    return Response(stats)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def projects_stats(request):
    """
    Get detailed project statistics
    """
    if not hasattr(request.user, "role") or request.user.role != "admin":
        return Response(
            {"error": "You do not have permission to perform this action."},
            status=status.HTTP_403_FORBIDDEN,
        )

    total_projects = Project.objects.count()

    # Projects created in the last 30 days
    last_30_days = timezone.now() - timezone.timedelta(days=30)
    recent_projects = Project.objects.filter(created_at__gte=last_30_days).count()

    stats = {
        "total_projects": total_projects,
        "recent_projects": recent_projects,
    }

    return Response(stats)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def sources_stats(request):
    """
    Get detailed source statistics
    """
    if not hasattr(request.user, "role") or request.user.role != "admin":
        return Response(
            {"error": "You do not have permission to perform this action."},
            status=status.HTTP_403_FORBIDDEN,
        )

    total_sources = Source.objects.count()

    # Sources created in the last 30 days
    last_30_days = timezone.now() - timezone.timedelta(days=30)
    recent_sources = Source.objects.filter(created_at__gte=last_30_days).count()

    stats = {
        "total_sources": total_sources,
        "recent_sources": recent_sources,
    }

    return Response(stats)
