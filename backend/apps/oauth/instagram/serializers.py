from rest_framework import serializers


class InstagramOAuthCodeSerializer(serializers.Serializer):
    code = serializers.CharField(required=True)
