import random
import string
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.product.models import Product
from apps.project.models import Project, ProjectUser
from apps.sources.models import Source

from .models import Expense

User = get_user_model()


class ExpenseModelTests(TestCase):
    def setUp(self):
        """Set up test data for model tests"""
        random_number = "".join(random.choices(string.digits, k=4))
        
        self.user = User.objects.create_user(
            email=f"user_{random_number}@test.com",
            name="Test User",
            password="TestPassword123_"
        )
        
        self.project = Project.objects.create(
            name="Test Project",
            description="Test project for expenses"
        )
        
        # Create a source for the product
        self.source = Source.objects.create(
            project=self.project,
            platform="youtube",
            account_name="Test Channel"
        )
        
        self.product = Product.objects.create(
            project=self.project,
            source=self.source,
            title="Test Product",
            description="Test product for expenses"
        )

    def test_expense_creation(self):
        """Test creating an expense with all required fields"""
        expense = Expense.objects.create(
            name="Marketing Fee",
            value=Decimal("100.00"),
            type=Expense.TYPE_STATIC,
            user=self.user,
            product=self.product,
            project=self.project
        )
        
        self.assertEqual(expense.name, "Marketing Fee")
        self.assertEqual(expense.value, Decimal("100.00"))
        self.assertEqual(expense.type, Expense.TYPE_STATIC)
        self.assertEqual(expense.user, self.user)
        self.assertEqual(expense.product, self.product)
        self.assertEqual(expense.project, self.project)
        self.assertFalse(expense.is_deleted)

    def test_expense_str_method(self):
        """Test the string representation of an expense"""
        expense = Expense.objects.create(
            name="Marketing Fee",
            value=Decimal("100.00"),
            type=Expense.TYPE_STATIC,
            user=self.user,
            product=self.product,
            project=self.project
        )
        
        expected_str = f"Marketing Fee - {self.project.name}"
        self.assertEqual(str(expense), expected_str)

    def test_expense_percentage_type(self):
        """Test creating an expense with percentage type"""
        expense = Expense.objects.create(
            name="Commission",
            value=Decimal("15.50"),
            type=Expense.TYPE_PERCENTAGE,
            user=self.user,
            product=self.product,
            project=self.project
        )
        
        self.assertEqual(expense.type, Expense.TYPE_PERCENTAGE)
        self.assertEqual(expense.value, Decimal("15.50"))


class ExpenseViewTests(TestCase):
    def setUp(self):
        """Set up test data for view tests"""
        self.client = APIClient()
        
        random_number = "".join(random.choices(string.digits, k=4))
        
        # Create users
        self.owner = User.objects.create_user(
            email=f"owner_{random_number}@test.com",
            name="Project Owner",
            password="TestPassword123_"
        )
        
        self.producer = User.objects.create_user(
            email=f"producer_{random_number}@test.com",
            name="Producer",
            password="TestPassword123_"
        )
        
        self.other_user = User.objects.create_user(
            email=f"other_{random_number}@test.com",
            name="Other User",
            password="TestPassword123_"
        )
        
        # Create project
        self.project = Project.objects.create(
            name="Test Project",
            description="Test project for expenses"
        )
        
        # Create project users
        self.owner_project_user = ProjectUser.objects.create(
            project=self.project,
            user=self.owner,
            role=ProjectUser.PROJECT_USER_ROLE_OWNER
        )
        
        self.producer_project_user = ProjectUser.objects.create(
            project=self.project,
            user=self.producer,
            role=ProjectUser.PROJECT_USER_ROLE_PRODUCER
        )
        
        # Set currently selected project
        self.owner.currently_selected_project = self.project
        self.owner.save()
        
        self.producer.currently_selected_project = self.project
        self.producer.save()
        
        # Create source and product
        self.source = Source.objects.create(
            project=self.project,
            platform="youtube",
            account_name="Test Channel"
        )
        
        self.product = Product.objects.create(
            project=self.project,
            source=self.source,
            title="Test Product",
            description="Test product for expenses"
        )
        
        # Create test expense
        self.expense = Expense.objects.create(
            name="Marketing Fee",
            value=Decimal("100.00"),
            type=Expense.TYPE_STATIC,
            user=self.producer,
            product=self.product,
            project=self.project
        )
        
        # URLs
        self.list_create_url = reverse("expense-list-create")
        self.detail_url = reverse("expense-detail", kwargs={"pk": self.expense.pk})
        self.members_url = reverse("project-members")
        self.products_url = reverse("project-products")

    def test_list_expenses_as_owner(self):
        """Test that project owners can list expenses"""
        self.client.force_authenticate(user=self.owner)
        
        response = self.client.get(self.list_create_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Marketing Fee")

    def test_list_expenses_as_producer_forbidden(self):
        """Test that producers cannot list expenses"""
        self.client.force_authenticate(user=self.producer)
        
        response = self.client.get(self.list_create_url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("Only project owners can view expenses", response.data["detail"])

    def test_create_expense_as_owner(self):
        """Test that project owners can create expenses"""
        self.client.force_authenticate(user=self.owner)
        
        data = {
            "name": "New Marketing Fee",
            "value": "50.00",  # Changed to valid percentage value
            "type": Expense.TYPE_PERCENTAGE,
            "user": self.producer.id,
            "product": self.product.id
        }
        
        response = self.client.post(self.list_create_url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "New Marketing Fee")
        self.assertEqual(response.data["type"], Expense.TYPE_PERCENTAGE)
        self.assertEqual(response.data["project"], self.project.id)

    def test_create_expense_as_producer_forbidden(self):
        """Test that producers cannot create expenses"""
        self.client.force_authenticate(user=self.producer)
        
        data = {
            "name": "New Marketing Fee",
            "value": "150.00",
            "type": Expense.TYPE_STATIC,
            "user": self.producer.id,
            "product": self.product.id
        }
        
        response = self.client.post(self.list_create_url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("Only project owners can create expenses", response.data["detail"])

    def test_create_expense_invalid_percentage(self):
        """Test creating expense with invalid percentage value"""
        self.client.force_authenticate(user=self.owner)
        
        data = {
            "name": "Invalid Percentage",
            "value": "150.00",  # Over 100%
            "type": Expense.TYPE_PERCENTAGE,
            "user": self.producer.id,
            "product": self.product.id
        }
        
        response = self.client.post(self.list_create_url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Percentage values must be between 0 and 100", str(response.data))

    def test_get_expense_detail_as_owner(self):
        """Test getting expense details as owner"""
        self.client.force_authenticate(user=self.owner)
        
        response = self.client.get(self.detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Marketing Fee")
        self.assertEqual(response.data["id"], self.expense.id)

    def test_update_expense_as_owner(self):
        """Test updating expense as owner"""
        self.client.force_authenticate(user=self.owner)
        
        data = {
            "name": "Updated Marketing Fee",
            "value": "200.00"
        }
        
        response = self.client.put(self.detail_url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Updated Marketing Fee")
        self.assertEqual(response.data["value"], "200.00")

    def test_delete_expense_as_owner(self):
        """Test deleting expense as owner (soft delete)"""
        self.client.force_authenticate(user=self.owner)
        
        response = self.client.delete(self.detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify soft delete
        self.expense.refresh_from_db()
        self.assertTrue(self.expense.is_deleted)

    def test_get_project_members_as_owner(self):
        """Test getting project members as owner"""
        self.client.force_authenticate(user=self.owner)
        
        response = self.client.get(self.members_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Owner and producer
        
        # Check that both users are in the response
        user_ids = [member["id"] for member in response.data]
        self.assertIn(self.owner.id, user_ids)
        self.assertIn(self.producer.id, user_ids)

    def test_get_project_products_as_owner(self):
        """Test getting project products as owner"""
        self.client.force_authenticate(user=self.owner)
        
        response = self.client.get(self.products_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Test Product")
        self.assertEqual(response.data[0]["id"], self.product.id)

    def test_non_project_member_access_forbidden(self):
        """Test that non-project members cannot access expenses"""
        self.client.force_authenticate(user=self.other_user)
        
        response = self.client.get(self.list_create_url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("You are not a member of this project", response.data["detail"])

    def test_create_expense_with_invalid_product_project_mismatch(self):
        """Test creating expense with product from different project fails"""
        # Create another project and product
        other_project = Project.objects.create(
            name="Other Project",
            description="Another project"
        )
        
        other_source = Source.objects.create(
            project=other_project,
            platform="youtube",
            account_name="Other Channel"
        )
        
        other_product = Product.objects.create(
            project=other_project,
            source=other_source,
            title="Other Product"
        )
        
        self.client.force_authenticate(user=self.owner)
        
        data = {
            "name": "Invalid Expense",
            "value": "100.00",
            "type": Expense.TYPE_STATIC,
            "user": self.producer.id,
            "product": other_product.id  # Product from different project
        }
        
        response = self.client.post(self.list_create_url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("does not belong to the specified project", str(response.data))


class ExpenseSerializerTests(TestCase):
    def setUp(self):
        """Set up test data for serializer tests"""
        random_number = "".join(random.choices(string.digits, k=4))
        
        self.user = User.objects.create_user(
            email=f"user_{random_number}@test.com",
            name="Test User",
            password="TestPassword123_"
        )
        
        self.project = Project.objects.create(
            name="Test Project",
            description="Test project"
        )
        
        ProjectUser.objects.create(
            project=self.project,
            user=self.user,
            role=ProjectUser.PROJECT_USER_ROLE_PRODUCER
        )
        
        self.source = Source.objects.create(
            project=self.project,
            platform="youtube",
            account_name="Test Channel"
        )
        
        self.product = Product.objects.create(
            project=self.project,
            source=self.source,
            title="Test Product"
        )

    def test_serializer_validation_percentage_bounds(self):
        """Test serializer validates percentage bounds"""
        from .serializers import ExpenseSerializer
        
        # Test valid percentage
        data = {
            "name": "Valid Percentage",
            "value": "50.00",
            "type": Expense.TYPE_PERCENTAGE,
            "user": self.user.id,
            "product": self.product.id,
            "project": self.project.id
        }
        
        serializer = ExpenseSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        
        # Test invalid percentage (over 100)
        data["value"] = "150.00"
        serializer = ExpenseSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("Percentage values must be between 0 and 100", str(serializer.errors))
        
        # Test invalid percentage (negative)
        data["value"] = "-10.00"
        serializer = ExpenseSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("Percentage values must be between 0 and 100", str(serializer.errors))
