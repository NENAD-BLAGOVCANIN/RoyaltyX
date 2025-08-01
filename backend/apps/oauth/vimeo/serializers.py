from rest_framework import serializers


class VimeoOAuthCodeSerializer(serializers.Serializer):
    code = serializers.CharField(required=True)
