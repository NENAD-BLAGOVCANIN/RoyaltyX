from rest_framework import serializers

from .models import InviteProductAccess, ProjectInvite


class InviteProductAccessSerializer(serializers.ModelSerializer):
    product_title = serializers.CharField(source="product.title", read_only=True)
    product_id = serializers.IntegerField(source="product.id", read_only=True)

    class Meta:
        model = InviteProductAccess
        fields = ["product_id", "product_title"]


class ProjectInviteSerializer(serializers.ModelSerializer):
    invited_by_name = serializers.CharField(source="invited_by.name", read_only=True)
    project_name = serializers.CharField(source="project.name", read_only=True)
    product_access = InviteProductAccessSerializer(many=True, read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = ProjectInvite
        fields = [
            "id",
            "email",
            "role",
            "created_at",
            "expires_at",
            "is_accepted",
            "accepted_at",
            "invited_by_name",
            "project_name",
            "product_access",
            "is_expired",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "expires_at",
            "is_accepted",
            "accepted_at",
            "invited_by_name",
            "project_name",
            "is_expired",
        ]


class CreateInviteSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(
        choices=ProjectInvite.ROLE_CHOICES, default="producer"
    )
    product_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False, allow_empty=True
    )

    def validate(self, data):
        # If role is producer, product_ids should be provided
        if data.get("role") == "producer" and not data.get("product_ids"):
            raise serializers.ValidationError(
                "Product access must be specified for producer role"
            )

        # If role is owner, product_ids should be empty
        if data.get("role") == "owner" and data.get("product_ids"):
            data["product_ids"] = []  # Clear product_ids for owners

        return data


class AcceptInviteSerializer(serializers.Serializer):
    """Serializer for accepting an invite - no input needed, just for validation"""

    pass


class InviteDetailsSerializer(serializers.ModelSerializer):
    """Serializer for showing invite details on the accept page"""

    project_name = serializers.CharField(source="project.name", read_only=True)
    project_description = serializers.CharField(
        source="project.description", read_only=True
    )
    invited_by_name = serializers.CharField(source="invited_by.name", read_only=True)
    invited_by_email = serializers.CharField(source="invited_by.email", read_only=True)
    product_access = InviteProductAccessSerializer(many=True, read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = ProjectInvite
        fields = [
            "id",
            "email",
            "role",
            "created_at",
            "expires_at",
            "project_name",
            "project_description",
            "invited_by_name",
            "invited_by_email",
            "product_access",
            "is_expired",
        ]
