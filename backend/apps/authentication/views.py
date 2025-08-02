from django.contrib.auth.hashers import check_password
from django.utils import timezone
from datetime import timedelta
from rest_framework import generics, status, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

from apps.authentication.serializer import UserRegistrationSerializer
from apps.emails.utils import (
    send_welcome_email,
    send_email_confirmation,
    generate_verification_code,
)

User = get_user_model()


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["id"] = user.id
        token["email"] = user.email
        token["username"] = user.username
        token["name"] = user.name
        token["avatar"] = user.avatar
        token["role"] = user.role
        token["subscription_plan"] = user.subscription_plan
        token["currently_selected_project_id"] = user.currently_selected_project_id
        token["is_email_verified"] = user.is_email_verified

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # Check if user's email is verified
        if not self.user.is_email_verified:
            raise serializers.ValidationError(
                {
                    "email_verification": "Please verify your email address before logging in.",
                    "email": self.user.email,
                    "verification_required": True,
                }
            )

        return data


class RegisterView(generics.GenericAPIView):
    def post(self, request, *args, **kwargs):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Generate verification code and set expiry
            verification_code = generate_verification_code()
            user.verification_code = verification_code
            user.verification_token_expiry = timezone.now() + timedelta(hours=24)
            user.save()

            # Create verification link
            verification_link = f"https://app.royaltyx.co/verify-email?email={user.email}&code={verification_code}"

            # Send email confirmation
            try:
                send_email_confirmation(
                    user_email=user.email,
                    user_name=user.name or user.username,
                    verification_code=verification_code,
                    verification_link=verification_link,
                )
            except Exception as e:
                print(f"Failed to send confirmation email: {e}", flush=True)

            return Response(
                {
                    "message": "Registration successful! Please check your email to verify your account.",
                    "email": user.email,
                    "verification_required": True,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        data = request.data

        current_password = data.get("current_password")
        new_password = data.get("new_password")
        confirm_password = data.get("confirm_password")

        if not current_password or not new_password or not confirm_password:
            return Response(
                {"error": "All fields are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not check_password(current_password, user.password):
            return Response(
                {"error": "Current password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new_password != confirm_password:
            return Response(
                {"error": "New password and confirm password do not match."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save()

        return Response(
            {"message": "Password changed successfully."}, status=status.HTTP_200_OK
        )


class VerifyEmailView(APIView):
    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        verification_code = request.data.get("code")

        if not email or not verification_code:
            return Response(
                {"error": "Email and verification code are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if user is already verified
        if user.is_email_verified:
            return Response(
                {"message": "Email is already verified."},
                status=status.HTTP_200_OK,
            )

        # Check if verification code matches
        if user.verification_code != verification_code:
            return Response(
                {"error": "Invalid verification code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if verification code has expired
        if (
            user.verification_token_expiry
            and timezone.now() > user.verification_token_expiry
        ):
            return Response(
                {"error": "Verification code has expired. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verify the user
        user.is_email_verified = True
        user.verification_code = None
        user.verification_token_expiry = None
        user.save()

        # Send welcome email now that email is verified
        try:
            send_welcome_email(
                user_email=user.email, user_name=user.name or user.username
            )
        except Exception as e:
            print(f"Failed to send welcome email: {e}", flush=True)

        # Generate JWT tokens for the verified user
        token_serializer = MyTokenObtainPairSerializer()
        token = token_serializer.get_token(user)

        return Response(
            {
                "message": "Email verified successfully!",
                "user": {"email": user.email, "name": user.name},
                "access": str(token.access_token),
                "refresh": str(token),
            },
            status=status.HTTP_200_OK,
        )


class ResendVerificationView(APIView):
    def post(self, request, *args, **kwargs):
        email = request.data.get("email")

        if not email:
            return Response(
                {"error": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if user is already verified
        if user.is_email_verified:
            return Response(
                {"message": "Email is already verified."},
                status=status.HTTP_200_OK,
            )

        # Generate new verification code and set expiry
        verification_code = generate_verification_code()
        user.verification_code = verification_code
        user.verification_token_expiry = timezone.now() + timedelta(hours=24)
        user.save()

        # Create verification link
        verification_link = f"https://app.royaltyx.co/verify-email?email={user.email}&code={verification_code}"

        # Send email confirmation
        try:
            send_email_confirmation(
                user_email=user.email,
                user_name=user.name or user.username,
                verification_code=verification_code,
                verification_link=verification_link,
            )
        except Exception as e:
            print(f"Failed to send confirmation email: {e}", flush=True)
            return Response(
                {"error": "Failed to send verification email. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {"message": "Verification email sent successfully!"},
            status=status.HTTP_200_OK,
        )
