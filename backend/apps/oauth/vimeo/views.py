import requests
from django.conf import settings
from apps.oauth.vimeo.serializers import VimeoOAuthCodeSerializer
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class VimeoTokenExchange(APIView):
    """
    POST: Get access and refresh token from Vimeo OAuth2 by providing
    an authorization code.
    """

    @extend_schema(
        request=VimeoOAuthCodeSerializer,
    )
    def post(self, request):
        serializer = VimeoOAuthCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data.get("code", None)

        token_url = "https://api.vimeo.com/oauth/access_token"
        data = {
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": settings.VIMEO_REDIRECT_URI,
        }

        # Vimeo uses basic auth with client credentials
        auth = (settings.VIMEO_CLIENT_ID, settings.VIMEO_CLIENT_SECRET)

        response = requests.post(
            token_url,
            data=data,
            auth=auth,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        print(f"Response from Vimeo token exchange: {response}")
        print(f"Response from Vimeo token exchange: {response.json()}")

        response.raise_for_status()

        token_data = response.json()

        return Response(token_data, status=status.HTTP_201_CREATED)
