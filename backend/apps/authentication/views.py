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
    send_password_reset_email,
    generate_password_reset_token,
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

        # Check if user account is deleted
        if self.user.is_deleted:
            raise serializers.ValidationError(
                {
                    "account_deleted": "This account has been deleted and cannot be accessed.",
                }
            )

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


class ForgotPasswordView(APIView):
    def post(self, request, *args, **kwargs):
        email = request.data.get("email")

        if not email:
            return Response(
                {"error": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Rate limiting check - prevent abuse
        from django.core.cache import cache
        import hashlib
        
        # Create a cache key based on IP address
        ip_address = self.get_client_ip(request)
        cache_key = f"password_reset_attempts_{hashlib.md5(ip_address.encode()).hexdigest()}"
        
        # Check if too many attempts from this IP (with cache fallback)
        try:
            attempts = cache.get(cache_key, 0)
            if attempts >= 5:  # Max 5 attempts per hour per IP
                return Response(
                    {"error": "Too many password reset attempts. Please try again later."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )
        except Exception as e:
            # If cache is not available, log the error but continue without rate limiting
            print(f"Cache not available for rate limiting: {e}", flush=True)
            attempts = 0

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # For security reasons, don't reveal if email exists or not
            # But still increment rate limiting counter
            try:
                cache.set(cache_key, attempts + 1, 3600)  # 1 hour
            except Exception:
                pass  # Ignore cache errors
            return Response(
                {"message": "If an account with this email exists, you will receive a password reset email shortly."},
                status=status.HTTP_200_OK,
            )

        # Check if user's email is verified
        if not user.is_email_verified:
            try:
                cache.set(cache_key, attempts + 1, 3600)
            except Exception:
                pass  # Ignore cache errors
            return Response(
                {"error": "Please verify your email address first before resetting your password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if user already has a recent reset request (prevent spam)
        if (user.password_reset_token_expiry and 
            timezone.now() < user.password_reset_token_expiry and
            user.password_reset_token):
            try:
                cache.set(cache_key, attempts + 1, 3600)
            except Exception:
                pass  # Ignore cache errors
            return Response(
                {"message": "A password reset email was already sent recently. Please check your email or wait before requesting another."},
                status=status.HTTP_200_OK,
            )

        # Generate password reset token and set expiry (1 hour)
        reset_token = generate_password_reset_token()
        user.password_reset_token = reset_token
        user.password_reset_token_expiry = timezone.now() + timedelta(hours=1)
        user.save()

        # Create reset link
        reset_link = f"https://app.royaltyx.co/reset-password?email={user.email}&token={reset_token}"

        # Send password reset email
        try:
            send_password_reset_email(
                user_email=user.email,
                user_name=user.name or user.username,
                reset_token=reset_token,
                reset_link=reset_link,
            )
            # Increment rate limiting counter only after successful email send
            try:
                cache.set(cache_key, attempts + 1, 3600)
            except Exception:
                pass  # Ignore cache errors
        except Exception as e:
            print(f"Failed to send password reset email: {e}", flush=True)
            return Response(
                {"error": "Failed to send password reset email. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {"message": "If an account with this email exists, you will receive a password reset email shortly."},
            status=status.HTTP_200_OK,
        )

    def get_client_ip(self, request):
        """Get the client's IP address from the request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class ResetPasswordView(APIView):
    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        token = request.data.get("token")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        if not email or not token or not new_password or not confirm_password:
            return Response(
                {"error": "All fields are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new_password != confirm_password:
            return Response(
                {"error": "New password and confirm password do not match."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Enhanced password validation
        password_errors = self.validate_password_strength(new_password)
        if password_errors:
            return Response(
                {"error": password_errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid reset token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if reset token matches
        if user.password_reset_token != token:
            return Response(
                {"error": "Invalid reset token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if reset token has expired
        if (
            user.password_reset_token_expiry
            and timezone.now() > user.password_reset_token_expiry
        ):
            return Response(
                {"error": "Reset token has expired. Please request a new password reset."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Reset the password
        user.set_password(new_password)
        user.password_reset_token = None
        user.password_reset_token_expiry = None
        user.save()

        return Response(
            {"message": "Password reset successfully! You can now log in with your new password."},
            status=status.HTTP_200_OK,
        )

    def validate_password_strength(self, password):
        """Validate password strength and return error message if invalid."""
        import re
        
        errors = []
        
        # Check minimum length
        if len(password) < 8:
            errors.append("Password must be at least 8 characters long")
        
        # Check for at least one uppercase letter
        if not re.search(r'[A-Z]', password):
            errors.append("Password must contain at least one uppercase letter")
        
        # Check for at least one lowercase letter
        if not re.search(r'[a-z]', password):
            errors.append("Password must contain at least one lowercase letter")
        
        # Check for at least one digit
        if not re.search(r'\d', password):
            errors.append("Password must contain at least one number")
        
        # Check for at least one special character
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append("Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)")
        
        # Check for common weak passwords
        weak_passwords = [
            'password', '12345678', 'qwerty123', 'abc123456', 'password123',
            'admin123', 'letmein123', 'welcome123', 'monkey123', '123456789'
        ]
        if password.lower() in weak_passwords:
            errors.append("This password is too common and easily guessable")
        
        return "; ".join(errors) if errors else None
