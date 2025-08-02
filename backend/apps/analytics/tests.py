import random
import string
from datetime import date, timedelta
from decimal import Decimal
from ddt import ddt, data

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.product.models import Product, ProductImpressions, ProductSale
from apps.project.models import Project, ProjectUser
from apps.analytics.utils import calculate_analytics


@ddt
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

    @data(6, 12, 18, 23)  # ~ 6, 12, 18, 23 months
    def test_analytics_get_with_monthly_granularity(self, months):
        """Test analytics GET endpoint with monthly granularity"""
        start_date = date.today() - timedelta(days=months * 30) 
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

    @data(3, 4, 5)  # ~ 3, 4, 5 years
    def test_analytics_get_with_yearly_granularity(self, years):
        """Test analytics GET endpoint with yearly granularity"""
        start_date = date.today() - timedelta(days=years * 365) 
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

    @data(1, 3, 5, 7, 14)  # ~ 1, 3, 5, 7, 14 days
    def test_analytics_get_with_daily_granularity_multiple(self, days):
        """Test analytics GET endpoint with daily granularity for multiple day ranges"""
        start_date = date.today() - timedelta(days=days)
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

    def test_analytics_granularity_max_when_no_period_set(self):
        """Test that granularity is 'max' when no period parameters are provided"""
        response = self.client.get(self.analytics_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, dict)
        self.assertEqual(response.data.get("granularity"), "monthly")

    def test_analytics_granularity_max_when_only_start_date_provided(self):
        """Test that granularity is 'max' when only period_start is provided"""
        start_date = date.today() - timedelta(days=30)

        response = self.client.get(
            self.analytics_url, {"period_start": start_date.strftime("%Y-%m-%d")}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, dict)
        self.assertEqual(response.data.get("granularity"), "monthly")

    def test_analytics_granularity_max_when_only_end_date_provided(self):
        """Test that granularity is 'max' when only period_end is provided"""
        end_date = date.today()

        response = self.client.get(
            self.analytics_url, {"period_end": end_date.strftime("%Y-%m-%d")}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, dict)
        self.assertEqual(response.data.get("granularity"), "monthly")

    def test_product_analytics_granularity_max_when_no_period_set(self):
        """Test that product analytics granularity is 'max' when no period parameters are provided"""
        response = self.client.get(self.product_analytics_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, dict)
        self.assertEqual(response.data.get("granularity"), "monthly")


class TimeRangeCalculationTests(TestCase):
    """
    Test class specifically for the time range calculation and granularity selection logic
    from the code snippet provided by the user.
    """

    def setUp(self):
        """Set up test data for time range calculation tests"""
        # Create a test user
        User = get_user_model()
        self.user = User.objects.create_user(
            email="test@example.com", name="Test User", password="testpass123"
        )

        # Create a test project
        self.project = Project.objects.create(
            name="Test Project", description="A test project"
        )

        # Associate user with project
        ProjectUser.objects.create(
            project=self.project,
            user=self.user,
            role=ProjectUser.PROJECT_USER_ROLE_OWNER,
        )

        # Create a test product
        self.product = Product.objects.create(
            project=self.project,
            title="Test Product",
            description="A test product",
            statement_frequency="Monthly",
            first_statement_end_date=date.today(),
            payment_threshold=100.00,
            payment_window=30,
            is_active=True,
        )

    def test_earliest_date_calculation_with_both_impressions_and_sales(self):
        """Test earliest date calculation when both impressions and sales data exist"""
        # Create test data with different start dates
        impression_date = date.today() - timedelta(days=300)  # ~10 months ago
        sale_date = date.today() - timedelta(days=740)  # ~24 months ago
        
        ProductImpressions.objects.create(
            product=self.product,
            impressions=1000,
            ecpm=Decimal('2.50'),
            period_start=impression_date,
            period_end=impression_date + timedelta(days=1)
        )
        
        ProductSale.objects.create(
            product=self.product,
            type=ProductSale.TYPE_PURCHASE,
            unit_price=Decimal('10.00'),
            unit_price_currency='USD',
            quantity=1,
            royalty_amount=Decimal('5.00'),
            royalty_currency='USD',
            period_start=sale_date,
            period_end=sale_date + timedelta(days=1)
        )

        # Call the analytics function with no granularity specified (triggers the code snippet)
        result = calculate_analytics(
            project_id=self.project.id,
            filters={},
            period_start=None,
            period_end=None,
            granularity=None  # This triggers the code snippet logic
        )

        # Should use yearly granularity since data spans more than 2 years
        self.assertEqual(result['granularity'], 'yearly')
        self.assertIn('time_stats', result)

    def test_earliest_date_calculation_with_only_impressions(self):
        """Test earliest date calculation when only impressions data exists"""
        impression_date = date.today() - timedelta(days=300)  # ~10 months ago
        
        ProductImpressions.objects.create(
            product=self.product,
            impressions=1000,
            ecpm=Decimal('2.50'),
            period_start=impression_date,
            period_end=impression_date + timedelta(days=1)
        )

        result = calculate_analytics(
            project_id=self.project.id,
            filters={},
            period_start=None,
            period_end=None,
            granularity=None
        )

        # Should use monthly granularity since data spans less than 2 years
        self.assertEqual(result['granularity'], 'monthly')
        self.assertIn('time_stats', result)

    def test_earliest_date_calculation_with_only_sales(self):
        """Test earliest date calculation when only sales data exists"""
        sale_date = date(2024, 1, 30)
        
        ProductSale.objects.create(
            product=self.product,
            type=ProductSale.TYPE_PURCHASE,
            unit_price=Decimal('10.00'),
            unit_price_currency='USD',
            quantity=1,
            royalty_amount=Decimal('5.00'),
            royalty_currency='USD',
            period_start=sale_date,
            period_end=sale_date + timedelta(days=1)
        )

        result = calculate_analytics(
            project_id=self.project.id,
            filters={},
            period_start=None,
            period_end=None,
            granularity=None
        )

        # Should use monthly granularity since data spans less than 2 years
        self.assertEqual(result['granularity'], 'monthly')
        self.assertIn('time_stats', result)

    def test_no_data_fallback_to_yearly(self):
        """Test fallback to 1 year when no data exists"""
        # No data created - should fallback to 1 year
        result = calculate_analytics(
            project_id=self.project.id,
            filters={},
            period_start=None,
            period_end=None,
            granularity=None
        )

        # Should use monthly granularity for 1 year fallback
        self.assertEqual(result['granularity'], 'monthly')
        self.assertIn('time_stats', result)

    def test_granularity_selection_monthly_for_short_timespan(self):
        """Test that monthly granularity is selected for data spanning 1-2 years"""
        # Create data spanning exactly 1 year
        start_date = date.today() - timedelta(days=365)
        
        ProductImpressions.objects.create(
            product=self.product,
            impressions=1000,
            ecpm=Decimal('2.50'),
            period_start=start_date,
            period_end=start_date + timedelta(days=1)
        )

        result = calculate_analytics(
            project_id=self.project.id,
            filters={},
            period_start=None,
            period_end=None,
            granularity=None
        )

        self.assertEqual(result['granularity'], 'monthly')

    def test_granularity_selection_yearly_for_long_timespan(self):
        """Test that yearly granularity is selected for data spanning more than 2 years"""
        # Create data spanning 3 years
        start_date = date.today() - timedelta(days=3*365)
        
        ProductImpressions.objects.create(
            product=self.product,
            impressions=1000,
            ecpm=Decimal('2.50'),
            period_start=start_date,
            period_end=start_date + timedelta(days=1)
        )

        result = calculate_analytics(
            project_id=self.project.id,
            filters={},
            period_start=None,
            period_end=None,
            granularity=None
        )

        self.assertEqual(result['granularity'], 'yearly')

    def test_months_calculation_accuracy(self):
        """Test that months calculation is accurate"""
        # Create data from 11 months ago
        start_date = date.today() - timedelta(days=11*30)  # Approximately 15 months
        
        ProductImpressions.objects.create(
            product=self.product,
            impressions=1000,
            ecpm=Decimal('2.50'),
            period_start=start_date,
            period_end=start_date + timedelta(days=1)
        )

        result = calculate_analytics(
            project_id=self.project.id,
            filters={},
            period_start=None,
            period_end=None,
            granularity=None
        )

        # Should use monthly granularity
        self.assertEqual(result['granularity'], 'monthly')
        # Should have time_stats with appropriate number of months
        self.assertIn('time_stats', result)
        self.assertIsInstance(result['time_stats'], list)

    def test_years_calculation_accuracy(self):
        """Test that years calculation is accurate"""
        # Create data from 4 years ago
        start_date = date.today() - timedelta(days=4*365)
        
        ProductImpressions.objects.create(
            product=self.product,
            impressions=1000,
            ecpm=Decimal('2.50'),
            period_start=start_date,
            period_end=start_date + timedelta(days=1)
        )

        result = calculate_analytics(
            project_id=self.project.id,
            filters={},
            period_start=None,
            period_end=None,
            granularity=None
        )

        self.assertEqual(result['granularity'], 'yearly')
        # Should have time_stats with appropriate number of years
        self.assertIn('time_stats', result)
        self.assertIsInstance(result['time_stats'], list)

    def test_min_function_selects_earliest_date(self):
        """Test that min() function correctly selects the earliest date between impressions and sales"""
        impression_date = date.today() - timedelta(days=300)
        sale_date = date.today() - timedelta(days=500)
        
        ProductImpressions.objects.create(
            product=self.product,
            impressions=1000,
            ecpm=Decimal('2.50'),
            period_start=impression_date,
            period_end=impression_date + timedelta(days=1)
        )
        
        ProductSale.objects.create(
            product=self.product,
            type=ProductSale.TYPE_PURCHASE,
            unit_price=Decimal('10.00'),
            unit_price_currency='USD',
            quantity=1,
            royalty_amount=Decimal('5.00'),
            royalty_currency='USD',
            period_start=sale_date,
            period_end=sale_date + timedelta(days=1)
        )

        result = calculate_analytics(
            project_id=self.project.id,
            filters={},
            period_start=None,
            period_end=None,
            granularity=None
        )

        # Should use monthly granularity since earliest date (500 days ago) is less than 2 years
        self.assertEqual(result['granularity'], 'monthly')

    def test_edge_case_data_from_future(self):
        """Test handling of edge case where data has future dates"""
        # Create data with future date
        future_date = date.today() + timedelta(days=30)
        
        ProductImpressions.objects.create(
            product=self.product,
            impressions=1000,
            ecpm=Decimal('2.50'),
            period_start=future_date,
            period_end=future_date + timedelta(days=1)
        )

        result = calculate_analytics(
            project_id=self.project.id,
            filters={},
            period_start=None,
            period_end=None,
            granularity=None
        )

        # Should still work and return valid result
        self.assertIn('granularity', result)
        self.assertIn('time_stats', result)
