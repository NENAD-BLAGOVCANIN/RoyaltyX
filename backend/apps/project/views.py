from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.product.models import Product
from apps.product.serializers import ProductSerializer

from .models import Project, ProjectUser, ProducerProductAccess
from .serializers import ProjectSerializer, ProjectUserSerializer, ProducerProductAccessSerializer


class ProjectListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = Project.objects.all()
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            project = serializer.save()
            # Add the creator as the owner
            ProjectUser.objects.create(project=project, user=request.user, role="owner")
            request.user.currently_selected_project_id = project.id
            request.user.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pk = request.user.currently_selected_project_id
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProjectSerializer(project)
        return Response(serializer.data)


class ProjectUserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        project_users = ProjectUser.objects.all()
        serializer = ProjectUserSerializer(project_users, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        data = request.data.copy()
        data["project"] = user.currently_selected_project_id
        serializer = ProjectUserSerializer(data=data)
        if serializer.is_valid():
            project_user = serializer.save()
            return Response(
                ProjectUserSerializer(project_user).data, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        """Retrieve a single ProjectUser by ID."""
        project_user = get_object_or_404(ProjectUser, id=id)
        serializer = ProjectUserSerializer(project_user)
        return Response(serializer.data)

    def delete(self, request, id):
        """Delete a ProjectUser by ID."""
        project_user = get_object_or_404(ProjectUser, id=id)
        project_user.delete()
        return Response(
            {"message": "ProjectUser deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )


class MyProjectsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = Project.objects.filter(project_users__user=request.user)
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)


class SwitchProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        project_id = request.data.get("project_id")

        if not project_id:
            return Response(
                {"error": "Project ID is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND
            )

        user = request.user
        user.currently_selected_project = project
        user.save()

        return Response(
            {"message": f"Switched to project {project.name}."},
            status=status.HTTP_200_OK,
        )


@api_view(http_method_names=["PUT"])
def updateProject(request):
    try:
        project = Project.objects.get(pk=request.user.currently_selected_project_id)
    except Project.DoesNotExist:
        return Response(
            {"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND
        )

    serializer = ProjectSerializer(project, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(http_method_names=["DELETE"])
def deleteProject(request):
    try:
        user = request.user
        project = Project.objects.get(pk=user.currently_selected_project_id)
        user.currently_selected_project_id = None
        user.save()
    except Project.DoesNotExist:
        return Response(
            {"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND
        )
    project.delete()
    return Response(
        {"message": "Project deleted successfully"}, status=status.HTTP_204_NO_CONTENT
    )


class ProjectProductsView(APIView):
    """Get all products in the current project for product access management."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        currently_selected_project_id = user.currently_selected_project_id
        
        if not currently_selected_project_id:
            return Response(
                {"error": "No project selected"}, status=status.HTTP_400_BAD_REQUEST
            )

        products = Product.objects.filter(project_id=currently_selected_project_id)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProducerProductAccessView(APIView):
    """Manage producer product access."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Set product access for a producer."""
        project_user_id = request.data.get('project_user_id')
        product_ids = request.data.get('product_ids', [])

        try:
            project_user = ProjectUser.objects.get(id=project_user_id)
        except ProjectUser.DoesNotExist:
            return Response(
                {"error": "Project user not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if project_user.role != ProjectUser.PROJECT_USER_ROLE_PRODUCER:
            return Response(
                {"error": "User is not a producer"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Clear existing access
        ProducerProductAccess.objects.filter(project_user=project_user).delete()

        # Add new access
        access_objects = []
        for product_id in product_ids:
            try:
                product = Product.objects.get(id=product_id, project=project_user.project)
                access_objects.append(
                    ProducerProductAccess(project_user=project_user, product=product)
                )
            except Product.DoesNotExist:
                continue

        ProducerProductAccess.objects.bulk_create(access_objects)

        return Response(
            {"message": "Product access updated successfully"}, 
            status=status.HTTP_200_OK
        )


class ProjectUserUpdateView(APIView):
    """Update project user role and product access."""
    permission_classes = [IsAuthenticated]

    def put(self, request, id):
        try:
            project_user = ProjectUser.objects.get(id=id)
        except ProjectUser.DoesNotExist:
            return Response(
                {"error": "Project user not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Update role
        new_role = request.data.get('role')
        if new_role:
            project_user.role = new_role
            project_user.save()

        # Handle product access for producers
        if new_role == ProjectUser.PROJECT_USER_ROLE_PRODUCER:
            product_ids = request.data.get('product_ids', [])
            
            # Clear existing access
            ProducerProductAccess.objects.filter(project_user=project_user).delete()

            # Add new access
            access_objects = []
            for product_id in product_ids:
                try:
                    product = Product.objects.get(id=product_id, project=project_user.project)
                    access_objects.append(
                        ProducerProductAccess(project_user=project_user, product=product)
                    )
                except Product.DoesNotExist:
                    continue

            ProducerProductAccess.objects.bulk_create(access_objects)
        elif new_role == ProjectUser.PROJECT_USER_ROLE_OWNER:
            # Clear product access for owners (they have access to all)
            ProducerProductAccess.objects.filter(project_user=project_user).delete()

        serializer = ProjectUserSerializer(project_user)
        return Response(serializer.data, status=status.HTTP_200_OK)
