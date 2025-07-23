import random
import string
from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.product.models import Product
from apps.project.models import Project, ProjectUser


class AnalyticsViewTests(TestCase):
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()

        # Create a test user
        User = get_user_model()
        random_number = "".join(random.choices(string.digits, k=4))
        self.email = f"test_user_{random_number}@test.com"
        self.password = "Testaccount1_"
        self.name = "Test User"

        self.user = User.objects.create_user(
            email=self.email, name=self.name, password=self.password
        )

        # Create a test project
        self.project = Project.objects.create(
            name="Test Project", description="A test project for analytics"
        )

        # Associate user with project
        ProjectUser.objects.create(
            project=self.project,
            user=self.user,
            role=ProjectUser.PROJECT_USER_ROLE_OWNER,
        )

        # Set the project as currently selected for the user
        self.user.currently_selected_project = self.project
        self.user.save()

        # Create a test product
        self.product = Product.objects.create(
            project=self.project,
            title="Test Product",
            description="A test product for analytics",
            statement_frequency="Monthly",
            first_statement_end_date=date.today(),
            payment_threshold=100.00,
            payment_window=30,
            is_active=True,
        )

        # Authenticate the user
        self.client.force_authenticate(user=self.user)

        # Define URLs
        self.analytics_url = reverse("project-analytics")
        self.product_analytics_url = reverse(
            "product-analytics", kwargs={"product_id": self.product.id}
        )

    def test_analytics_endpoint_without_parameters(self):
        """Test analytics endpoint without any query parameters"""
        response = self.client.get(self.analytics_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, dict)

    def test_analytics_endpoint_with_date_parameters(self):
        """Test analytics endpoint with period_start and period_end parameters"""
        start_date = date.today() - timedelta(days=30)
        end_date = date.today()

        response = self.client.get(
            self.analytics_url,
            {
                "period_start": start_date.strftime("%Y-%m-%d"),
                "period_end": end_date.strftime("%Y-%m-%d"),
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, dict)

    def test_analytics_endpoint_with_only_start_date(self):
        """Test analytics endpoint with only period_start parameter"""
        start_date = date.today() - timedelta(days=30)

        response = self.client.get(
            self.analytics_url, {"period_start": start_date.strftime("%Y-%m-%d")}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, dict)

    def test_analytics_endpoint_with_only_end_date(self):
        """Test analytics endpoint with only period_end parameter"""
        end_date = date.today()

        response = self.client.get(
            self.analytics_url, {"period_end": end_date.strftime("%Y-%m-%d")}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, dict)

    def test_product_analytics_endpoint_without_parameters(self):
        """Test product-specific analytics endpoint without query parameters"""
        response = self.client.get(self.product_analytics_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, dict)

    def test_product_analytics_endpoint_with_date_parameters(self):
        """Test product-specific analytics endpoint with date parameters"""
        start_date = date.today() - timedelta(days=30)
        end_date = date.today()

        response = self.client.get(
            self.product_analytics_url,
            {
                "period_start": start_date.strftime("%Y-%m-%d"),
                "period_end": end_date.strftime("%Y-%m-%d"),
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, dict)

    def test_analytics_endpoint_requires_authentication(self):
        """Test that analytics endpoint requires authentication"""
        # Remove authentication
        self.client.force_authenticate(user=None)

        response = self.client.get(self.analytics_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_product_analytics_endpoint_requires_authentication(self):
        """Test that product analytics endpoint requires authentication"""
        # Remove authentication
        self.client.force_authenticate(user=None)

        response = self.client.get(self.product_analytics_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_analytics_endpoint_with_invalid_date_format(self):
        """Test analytics endpoint with invalid date format"""
        response = self.client.get(
            self.analytics_url,
            {
                "period_start": "invalid-date",
                "period_end": "2023-13-45",  # Invalid date
            },
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_product_analytics_with_nonexistent_product_id(self):
        """Test product analytics endpoint with non-existent product ID"""
        nonexistent_product_url = reverse(
            "product-analytics", kwargs={"product_id": 99999}
        )

        response = self.client.get(nonexistent_product_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, dict)

    def test_analytics_get_with_daily_granularity(self):
        """Test analytics GET endpoint with daily granularity (7 days range)"""
        start_date = date.today() - timedelta(days=7)
        end_date = date.today()

        response = self.client.get(
            self.analytics_url,
            {
                "period_start": start_date.strftime("%Y-%m-%d"),
                "period_end": end_date.strftime("%Y-%m-%d"),
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, dict)
        self.assertEqual(response.data.get("granularity"), "daily")

    def test_analytics_get_with_monthly_granularity(self):
        """Test analytics GET endpoint with monthly granularity (6 months range)"""
        start_date = date.today() - timedelta(days=180)  # ~6 months
        end_date = date.today()

        response = self.client.get(
            self.analytics_url,
            {
                "period_start": start_date.strftime("%Y-%m-%d"),
                "period_end": end_date.strftime("%Y-%m-%d"),
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, dict)
        self.assertEqual(response.data.get("granularity"), "monthly")

    def test_analytics_get_with_yearly_granularity(self):
        """Test analytics GET endpoint with yearly granularity (2 years range)"""
        start_date = date.today() - timedelta(days=730)  # ~2 years
        end_date = date.today()

        response = self.client.get(
            self.analytics_url,
            {
                "period_start": start_date.strftime("%Y-%m-%d"),
                "period_end": end_date.strftime("%Y-%m-%d"),
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, dict)
        self.assertEqual(response.data.get("granularity"), "yearly")
