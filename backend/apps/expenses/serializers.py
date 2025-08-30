from rest_framework import serializers

from .models import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True)
    
    class Meta:
        model = Expense
        fields = [
            'id',
            'name',
            'value',
            'type',
            'user',
            'user_name',
            'product',
            'product_title',
            'project',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user_name', 'product_title']

    def validate(self, data):
        """
        Validate that the user and product belong to the same project
        """
        user = data.get('user')
        product = data.get('product')
        project = data.get('project')
        
        if product and project and product.project != project:
            raise serializers.ValidationError(
                "The selected product does not belong to the specified project."
            )
        
        # Validate that the user is a member of the project
        if user and project:
            from apps.project.models import ProjectUser
            if not ProjectUser.objects.filter(user=user, project=project).exists():
                raise serializers.ValidationError(
                    "The selected user is not a member of the specified project."
                )
        
        # Validate percentage values
        if data.get('type') == Expense.TYPE_PERCENTAGE:
            value = data.get('value')
            if value and (value < 0 or value > 100):
                raise serializers.ValidationError(
                    "Percentage values must be between 0 and 100."
                )
        
        return data


class ExpenseListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views"""
    user_name = serializers.CharField(source='user.name', read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True)
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    
    class Meta:
        model = Expense
        fields = [
            'id',
            'name',
            'value',
            'type',
            'user_name',
            'product_title',
            'product_id',
            'created_at'
        ]
