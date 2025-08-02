from rest_framework import serializers

from apps.user.models import User
from apps.user.serializers import UserSerializer

from .models import Project, ProjectUser, ProducerProductAccess


class ProducerProductAccessSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProducerProductAccess
        fields = ["id", "project_user", "product", "created_at"]


class ProjectUserSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True
    )
    user_details = UserSerializer(source="user", read_only=True)
    accessible_products = serializers.SerializerMethodField()

    class Meta:
        model = ProjectUser
        fields = ["id", "project", "user", "user_details", "role", "accessible_products"]

    def get_accessible_products(self, obj):
        if obj.role == ProjectUser.PROJECT_USER_ROLE_PRODUCER:
            return list(obj.product_access.values_list('product_id', flat=True))
        return []


class ProjectSerializer(serializers.ModelSerializer):
    users = ProjectUserSerializer(source="project_users", many=True, read_only=True)

    class Meta:
        model = Project
        fields = "__all__"
