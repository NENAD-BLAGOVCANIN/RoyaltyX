from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.product.models import Product
from apps.project.models import ProjectUser

from .models import Expense
from .serializers import ExpenseListSerializer, ExpenseSerializer


class ExpenseListCreateView(APIView):
    """
    GET: Returns a list of expenses for the current project.
    POST: Create a new expense (only project owners can create expenses).
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all expenses for the current project"""
        try:
            project_user = ProjectUser.objects.get(
                user=request.user,
                project_id=request.user.currently_selected_project_id
            )
            
            # Only project owners can view expenses
            if project_user.role != ProjectUser.PROJECT_USER_ROLE_OWNER:
                return Response(
                    {"detail": "Only project owners can view expenses."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            expenses = Expense.objects.filter(
                project_id=request.user.currently_selected_project_id,
                is_deleted=False
            )
            serializer = ExpenseListSerializer(expenses, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except ProjectUser.DoesNotExist:
            return Response(
                {"detail": "You are not a member of this project."},
                status=status.HTTP_403_FORBIDDEN
            )

    @extend_schema(
        request=ExpenseSerializer,
    )
    def post(self, request):
        """Create a new expense"""
        try:
            project_user = ProjectUser.objects.get(
                user=request.user,
                project_id=request.user.currently_selected_project_id
            )
            
            # Only project owners can create expenses
            if project_user.role != ProjectUser.PROJECT_USER_ROLE_OWNER:
                return Response(
                    {"detail": "Only project owners can create expenses."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            data = request.data.copy()
            data["project"] = request.user.currently_selected_project_id
            
            serializer = ExpenseSerializer(data=data)
            if serializer.is_valid():
                expense = serializer.save()
                return Response(
                    ExpenseSerializer(expense).data, 
                    status=status.HTTP_201_CREATED
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except ProjectUser.DoesNotExist:
            return Response(
                {"detail": "You are not a member of this project."},
                status=status.HTTP_403_FORBIDDEN
            )


class ExpenseDetailView(APIView):
    """
    GET: Returns a single expense
    PUT: Update an expense
    DELETE: Delete an expense
    """

    permission_classes = [IsAuthenticated]

    def get_expense(self, pk, user):
        """Helper method to get expense and check permissions"""
        try:
            project_user = ProjectUser.objects.get(
                user=user,
                project_id=user.currently_selected_project_id
            )
            
            # Only project owners can manage expenses
            if project_user.role != ProjectUser.PROJECT_USER_ROLE_OWNER:
                return None, Response(
                    {"detail": "Only project owners can access expenses."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            expense = Expense.objects.get(
                pk=pk, 
                project_id=user.currently_selected_project_id,
                is_deleted=False
            )
            return expense, None
            
        except ProjectUser.DoesNotExist:
            return None, Response(
                {"detail": "You are not a member of this project."},
                status=status.HTTP_403_FORBIDDEN
            )
        except Expense.DoesNotExist:
            return None, Response(
                {"detail": "Expense not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

    def get(self, request, pk):
        """Get a single expense"""
        expense, error_response = self.get_expense(pk, request.user)
        if error_response:
            return error_response
        
        serializer = ExpenseSerializer(expense)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=ExpenseSerializer,
    )
    def put(self, request, pk):
        """Update an expense"""
        expense, error_response = self.get_expense(pk, request.user)
        if error_response:
            return error_response
        
        data = request.data.copy()
        data["project"] = request.user.currently_selected_project_id
        
        serializer = ExpenseSerializer(expense, data=data, partial=True)
        if serializer.is_valid():
            updated_expense = serializer.save()
            return Response(
                ExpenseSerializer(updated_expense).data, 
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete an expense (soft delete)"""
        expense, error_response = self.get_expense(pk, request.user)
        if error_response:
            return error_response
        
        expense.is_deleted = True
        expense.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectMembersView(APIView):
    """
    GET: Returns a list of project members for expense assignment
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all members of the current project"""
        try:
            project_user = ProjectUser.objects.get(
                user=request.user,
                project_id=request.user.currently_selected_project_id
            )
            
            # Only project owners can view members for expense assignment
            if project_user.role != ProjectUser.PROJECT_USER_ROLE_OWNER:
                return Response(
                    {"detail": "Only project owners can view project members."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            project_users = ProjectUser.objects.filter(
                project_id=request.user.currently_selected_project_id
            ).select_related('user')
            
            members = []
            for pu in project_users:
                members.append({
                    'id': pu.user.id,
                    'name': pu.user.name,
                    'email': pu.user.email,
                    'role': pu.role
                })
            
            return Response(members, status=status.HTTP_200_OK)
            
        except ProjectUser.DoesNotExist:
            return Response(
                {"detail": "You are not a member of this project."},
                status=status.HTTP_403_FORBIDDEN
            )


class ProjectProductsView(APIView):
    """
    GET: Returns a list of products in the current project for expense assignment
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all products in the current project"""
        try:
            project_user = ProjectUser.objects.get(
                user=request.user,
                project_id=request.user.currently_selected_project_id
            )
            
            # Only project owners can view products for expense assignment
            if project_user.role != ProjectUser.PROJECT_USER_ROLE_OWNER:
                return Response(
                    {"detail": "Only project owners can view project products."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            products = Product.objects.filter(
                project_id=request.user.currently_selected_project_id,
                is_active=True
            )
            
            product_list = []
            for product in products:
                product_list.append({
                    'id': product.id,
                    'title': product.title,
                    'description': product.description
                })
            
            return Response(product_list, status=status.HTTP_200_OK)
            
        except ProjectUser.DoesNotExist:
            return Response(
                {"detail": "You are not a member of this project."},
                status=status.HTTP_403_FORBIDDEN
            )
