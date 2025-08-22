import requests
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.emails.utils import send_welcome_email

from .views import MyTokenObtainPairSerializer

User = get_user_model()


class GoogleAuthView(APIView):
    """
    Handle Google OAuth authentication
    """
    
    def post(self, request):
        try:
            # Get the access token from the request
            access_token = request.data.get('access_token')
            
            if not access_token:
                return Response(
                    {'error': 'Access token is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verify the token with Google and get user info
            google_user_info_url = f'https://www.googleapis.com/oauth2/v2/userinfo?access_token={access_token}'
            google_response = requests.get(google_user_info_url)
            
            if google_response.status_code != 200:
                return Response(
                    {'error': 'Invalid Google access token'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            google_user_data = google_response.json()
            
            # Extract user information
            email = google_user_data.get('email')
            name = google_user_data.get('name')
            picture = google_user_data.get('picture')
            
            if not email:
                return Response(
                    {'error': 'Email not provided by Google'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user_created = False
            try:
                user = User.objects.get(email=email)
                
                # Check if user account is deleted
                if user.is_deleted:
                    return Response(
                        {'error': 'This account has been deleted and cannot be accessed.'}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
                
                # Update user info if needed
                if name and user.name != name:
                    user.name = name
                if picture and user.avatar != picture:
                    user.avatar = picture
                user.save()
            except User.DoesNotExist:
                user = User(
                    email=email,
                    username=email,
                    name=name or email.split('@')[0],
                    avatar=picture or User.objects.generate_avatar_url(name or email.split('@')[0]),
                    is_active=True,
                    is_email_verified=True  # Google accounts are pre-verified
                )
                # Don't set a password for Google users
                user.save()
                user_created = True
                
                try:
                    send_welcome_email(
                        user_email=user.email,
                        user_name=user.name or user.username
                    )
                except Exception as e:
                    print(e, flush=True)
                
            # Generate JWT tokens
            token = MyTokenObtainPairSerializer.get_token(user)
            
            return Response({
                'access': str(token.access_token),
                'refresh': str(token),
                'user_created': user_created,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name,
                    'avatar': user.avatar,
                    'role': user.role,
                    'subscription_plan': user.subscription_plan,
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Authentication failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
