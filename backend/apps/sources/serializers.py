from rest_framework import serializers

from apps.product.models import Product

from .models import Source


class SourceSerializer(serializers.ModelSerializer):
    access_token = serializers.CharField(
        write_only=True, required=False, allow_null=True
    )
    refresh_token = serializers.CharField(
        write_only=True, required=False, allow_null=True
    )
    imported_video_count = serializers.SerializerMethodField()

    class Meta:
        model = Source
        exclude = [
            "_access_token",
            "_refresh_token",
        ]  # hide internal fields from the API

    def create(self, validated_data):
        access_token = validated_data.pop("access_token", None)
        refresh_token = validated_data.pop("refresh_token", None)
        instance = Source(**validated_data)
        if access_token:
            instance.access_token = access_token
        if refresh_token:
            instance.refresh_token = refresh_token
        instance.save()
        return instance

    def get_imported_video_count(self, obj):
        return Product.objects.filter(source=obj).count()

    def to_representation(self, instance):
        # You can choose to include decrypted tokens here if needed (not recommended)
        rep = super().to_representation(instance)
        # rep["access_token"] = instance.access_token  # optional
        # rep["refresh_token"] = instance.refresh_token  # optional
        return rep
