from django.db.models import Sum
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.project.models import ProjectUser, ProducerProductAccess

from .models import Product
from .serializers import ProductSerializer


class ProductListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        currently_selected_project_id = user.currently_selected_project_id

        try:
            project_user = ProjectUser.objects.get(
                project_id=currently_selected_project_id, user=user
            )
        except ProjectUser.DoesNotExist:
            return Response(
                {"error": "User is not part of this project."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if project_user.role == ProjectUser.PROJECT_USER_ROLE_OWNER:
            products = Product.objects.filter(project_id=currently_selected_project_id)
        elif project_user.role == ProjectUser.PROJECT_USER_ROLE_PRODUCER:
            # Producers can only see products they have been given access to
            accessible_product_ids = ProducerProductAccess.objects.filter(
                project_user=project_user
            ).values_list('product_id', flat=True)
            products = Product.objects.filter(id__in=accessible_product_ids)
        else:
            products = Product.objects.none()

        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def product_detail(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response(
            {"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "GET":
        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "PUT":
        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        product.delete()
        return Response(
            {"message": "Product deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )


@api_view(http_method_names=["GET"])
@permission_classes([IsAuthenticated])
def getTopPerformingContentByImpressions(request):
    user = request.user
    currently_selected_project_id = user.currently_selected_project_id

    try:
        project_user = ProjectUser.objects.get(
            project_id=currently_selected_project_id, user=user
        )
    except ProjectUser.DoesNotExist:
        return Response(
            {"error": "User is not part of this project."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Apply role-based filtering
    if project_user.role == ProjectUser.PROJECT_USER_ROLE_OWNER:
        products = Product.objects.filter(project_id=currently_selected_project_id)
    elif project_user.role == ProjectUser.PROJECT_USER_ROLE_PRODUCER:
        # Producers can only see products they have been given access to
        accessible_product_ids = ProducerProductAccess.objects.filter(
            project_user=project_user
        ).values_list('product_id', flat=True)
        products = Product.objects.filter(id__in=accessible_product_ids)
    else:
        products = Product.objects.none()

    products = (
        products
        .annotate(total_impressions=Sum("productimpressions__impressions"))
        .filter(total_impressions__gt=0)
        .order_by("-total_impressions")[:10]
    )
    
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(http_method_names=["GET"])
@permission_classes([IsAuthenticated])
def getTopPerformingContentBySales(request):
    user = request.user
    currently_selected_project_id = user.currently_selected_project_id

    try:
        project_user = ProjectUser.objects.get(
            project_id=currently_selected_project_id, user=user
        )
    except ProjectUser.DoesNotExist:
        return Response(
            {"error": "User is not part of this project."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Apply role-based filtering
    if project_user.role == ProjectUser.PROJECT_USER_ROLE_OWNER:
        products = Product.objects.filter(project_id=currently_selected_project_id)
    elif project_user.role == ProjectUser.PROJECT_USER_ROLE_PRODUCER:
        # Producers can only see products they have been given access to
        accessible_product_ids = ProducerProductAccess.objects.filter(
            project_user=project_user
        ).values_list('product_id', flat=True)
        products = Product.objects.filter(id__in=accessible_product_ids)
    else:
        products = Product.objects.none()

    products = (
        products
        .annotate(total_sales=Sum("productsale__royalty_amount"))
        .filter(total_sales__gt=0)
        .order_by("-total_sales")[:10]
    )
    
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
