import requests
from django.conf import settings
from apps.oauth.instagram.serializers import InstagramOAuthCodeSerializer
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class InstagramTokenExchange(APIView):
    """
    POST: Get access and refresh token from Instagram OAuth2 by providing
    an authorization code.
    """

    @extend_schema(
        request=InstagramOAuthCodeSerializer,
    )
    def post(self, request):
        serializer = InstagramOAuthCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data.get("code", None)

        token_url = "https://api.instagram.com/oauth/access_token"
        data = {
            "client_id": settings.INSTAGRAM_CLIENT_ID,
            "client_secret": settings.INSTAGRAM_CLIENT_SECRET,
            "grant_type": "authorization_code",
            "redirect_uri": settings.INSTAGRAM_REDIRECT_URI,
            "code": code,
        }

        response = requests.post(
            token_url,
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        print(f"Response from Instagram token exchange: {response}")
        print(f"Response from Instagram token exchange: {response.json()}")

        response.raise_for_status()

        token_data = response.json()

        # Exchange short-lived token for long-lived token
        if "access_token" in token_data:
            long_lived_token_url = "https://graph.instagram.com/access_token"
            long_lived_params = {
                "grant_type": "ig_exchange_token",
                "client_secret": settings.INSTAGRAM_CLIENT_SECRET,
                "access_token": token_data["access_token"],
            }

            long_lived_response = requests.get(long_lived_token_url, params=long_lived_params)
            
            if long_lived_response.status_code == 200:
                long_lived_data = long_lived_response.json()
                token_data.update(long_lived_data)

        return Response(token_data, status=status.HTTP_201_CREATED)
