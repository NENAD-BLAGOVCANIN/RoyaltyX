from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import User
from .serializers import SubscriptionPlanSerializer, UserSerializer


@api_view(["GET"])
def get_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def getMyUserInfo(request):
    user = request.user
    serializer = UserSerializer(user, many=False, context={"request": request})

    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_subscription_plan(request):
    """Get the current user's subscription plan"""
    user = request.user
    serializer = SubscriptionPlanSerializer(user)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_subscription_plan(request):
    """Change the current user's subscription plan"""
    user = request.user
    new_plan = request.data.get("subscription_plan")

    if not new_plan:
        return Response(
            {"error": "subscription_plan is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Validate that the subscription plan is one of the allowed choices
    valid_plans = [choice[0] for choice in User.SUBSCRIPTION_PLAN_CHOICES]

    if new_plan not in valid_plans:
        return Response(
            {
                "error": f"Invalid subscription plan. Valid options are: {', '.join(valid_plans)}"  # noqa: E501
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Check if user is already on this plan
    if user.subscription_plan == new_plan:
        return Response(
            {"error": f"You are already on the {new_plan} plan"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # If downgrading to free, handle directly
    if new_plan == "free":
        # Cancel existing subscription if any
        if user.stripe_subscription_id:
            try:
                from apps.payments.stripe_service import StripeService

                StripeService.cancel_subscription(user.stripe_subscription_id)
            except Exception as e:
                return Response(
                    {"error": f"Failed to cancel subscription: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        # Update user to free plan
        user.subscription_plan = "free"
        user.subscription_status = "canceled"
        user.stripe_subscription_id = None
        user.subscription_current_period_end = None
        user.save()

        return Response(
            {
                "message": "Successfully downgraded to free plan",
                "subscription_plan": "free",
            }
        )

    # For paid plans, redirect to payment processing
    else:
        return Response(
            {
                "requires_payment": True,
                "message": f"Payment required for {new_plan} plan.",
                "redirect_to": "/payments/create-checkout-session/",
                "plan": new_plan,
            },
            status=status.HTTP_402_PAYMENT_REQUIRED,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_available_plans(request):
    """Get all available subscription plans"""
    plans = [
        {"value": choice[0], "label": choice[1]}
        for choice in User.SUBSCRIPTION_PLAN_CHOICES
    ]
    return Response({"plans": plans})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password"""
    user = request.user
    current_password = request.data.get("current_password")
    new_password = request.data.get("new_password")

    if not current_password or not new_password:
        return Response(
            {"error": "Both current_password and new_password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Verify current password
    if not user.check_password(current_password):
        return Response(
            {"error": "Current password is incorrect"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Validate new password length
    if len(new_password) < 8:
        return Response(
            {"error": "New password must be at least 8 characters long"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Set new password
    user.set_password(new_password)
    user.save()

    return Response(
        {"message": "Password changed successfully"}, status=status.HTTP_200_OK
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def delete_account(request):
    """Delete user account (soft delete)"""
    user = request.user

    # Check if user is already deleted
    if user.is_deleted:
        return Response(
            {"error": "Account is already deleted"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # Cancel active subscription if any
        if user.stripe_subscription_id:
            from apps.payments.stripe_service import StripeService
            StripeService.cancel_subscription(user.stripe_subscription_id)

        # Update user to deleted status
        user.is_deleted = True
        user.is_active = False
        user.subscription_plan = "free"
        user.subscription_status = "canceled"
        user.stripe_subscription_id = None
        user.stripe_customer_id = None
        user.subscription_current_period_end = None
        user.grace_period_end = None
        user.save()

        return Response(
            {"message": "Account deleted successfully"},
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        return Response(
            {"error": f"Failed to delete account: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
