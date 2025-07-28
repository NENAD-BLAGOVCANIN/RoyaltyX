from rest_framework import serializers

from apps.sources.serializers import SourceSerializer
from apps.user.models import User
from apps.user.serializers import UserSerializer

from .models import Product, ProductImpressions, ProductSale


class ProductSaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSale
        fields = "__all__"


class ProductImpressionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImpressions
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    sales = ProductSaleSerializer(many=True, read_only=True, source="productsale_set")
    source = SourceSerializer(many=False, read_only=True)
    impressions = ProductImpressionsSerializer(
        many=True, read_only=True, source="productimpressions_set"
    )

    class Meta:
        model = Product
        fields = "__all__"
