from datetime import date, datetime
from unittest.mock import Mock, patch
from urllib.parse import urlencode

from django.contrib.auth import get_user_model
from django.template.loader import render_to_string
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.project.models import Project, ProjectUser
from apps.report.models import Report, ReportTemplates

User = get_user_model()


class ReportModelTests(TestCase):
    """Test cases for Report model"""

    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com", name="Test User", password="testpass123"
        )
        self.project = Project.objects.create(
            name="Test Project", description="Test project description"
        )
        self.template = ReportTemplates.objects.create(
            template_name="Test Template", project=self.project, created_by=self.user
        )

    def test_create_report(self):
        """Test creating a report"""
        report = Report.objects.create(
            filename="test_report.pdf",
            project=self.project,
            template=self.template,
            created_by=self.user,
            period_start=date(2024, 1, 1),
            period_end=date(2024, 12, 31),
        )

        self.assertEqual(report.filename, "test_report.pdf")
        self.assertEqual(report.project, self.project)
        self.assertEqual(report.template, self.template)
        self.assertEqual(report.created_by, self.user)
        self.assertEqual(report.period_start, date(2024, 1, 1))
        self.assertEqual(report.period_end, date(2024, 12, 31))
        self.assertFalse(report.is_deleted)


class ReportTemplateViewTests(TestCase):
    """Test cases for ReportTemplate API views"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="test@example.com", name="Test User", password="testpass123"
        )
        self.project = Project.objects.create(
            name="Test Project", description="Test project description"
        )
        ProjectUser.objects.create(
            project=self.project,
            user=self.user,
            role=ProjectUser.PROJECT_USER_ROLE_OWNER,
        )
        self.user.currently_selected_project = self.project
        self.user.save()

        self.client.force_authenticate(user=self.user)
        self.template_list_url = reverse("report-template-view")

    def test_get_report_templates(self):
        """Test retrieving report templates"""
        # Create test templates
        ReportTemplates.objects.create(
            template_name="Template 1", project=self.project, created_by=self.user
        )
        ReportTemplates.objects.create(
            template_name="Template 2", project=self.project, created_by=self.user
        )

        response = self.client.get(self.template_list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(
            response.data[0]["template_name"], "Template 2"
        )  # Ordered by -created_at

    def test_create_report_template(self):
        """Test creating a new report template"""
        data = {
            "template_name": "New Template",
            "title": "New Report Title",
            "address": "456 New Street",
            "include_sales_revenue": True,
            "include_impressions": False,
            "include_impressions_revenue": True,
        }

        response = self.client.post(self.template_list_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            ReportTemplates.objects.filter(template_name="New Template").count(), 1
        )

        template = ReportTemplates.objects.filter(template_name="New Template").first()
        self.assertEqual(template.template_name, "New Template")
        self.assertEqual(template.title, "New Report Title")
        self.assertEqual(template.created_by, self.user)
        self.assertEqual(template.project, self.project)


class ReportsViewTests(TestCase):
    """Test cases for Reports API views"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="test@example.com", name="Test User", password="testpass123"
        )
        self.project = Project.objects.create(
            name="Test Project", description="Test project description"
        )
        ProjectUser.objects.create(
            project=self.project,
            user=self.user,
            role=ProjectUser.PROJECT_USER_ROLE_OWNER,
        )
        self.user.currently_selected_project = self.project
        self.user.save()

        self.template = ReportTemplates.objects.create(
            template_name="Test Template", project=self.project, created_by=self.user
        )

        self.client.force_authenticate(user=self.user)
        self.reports_url = reverse("reports-view")

    @patch("apps.report.views.report.create_notification")
    @patch("apps.report.views.report.HTML")
    def test_create_report(self, mock_html, mock_create_notification):
        """Test creating a new report"""

        # Mock HTML to PDF conversion
        mock_html_instance = Mock()
        mock_html_instance.write_pdf.return_value = b"fake pdf content"
        mock_html.return_value = mock_html_instance

        params = {
            "template": self.template.id,
            "period_start": "2024-01-01",
            "period_end": "2024-12-31",
        }
        url = f"{self.reports_url}?{urlencode(params)}"
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        report = Report.objects.first()
        self.assertEqual(report.template, self.template)
        self.assertEqual(report.created_by, self.user)
        self.assertEqual(report.project, self.project)
        self.assertIsNotNone(report.file)

        # Verify mocks were called
        mock_create_notification.assert_called_once()
        mock_html.assert_called_once()

    def test_create_report_invalid_template(self):
        """Test creating report with invalid template"""
        data = {
            "template": 99999,  # Non-existent template
            "period_start": "2024-01-01",
            "period_end": "2024-12-31",
        }

        response = self.client.post(self.reports_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("This field is required.", str(response.data))

    def test_create_report_missing_template(self):
        """Test creating report without template"""
        data = {"period_start": "2024-01-01", "period_end": "2024-12-31"}

        response = self.client.post(self.reports_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_report_invalid_date_format(self):
        """Test creating report with invalid date format"""
        data = {
            "template": self.template.id,
            "period_start": "invalid-date",
            "period_end": "2024-12-31",
        }

        response = self.client.post(self.reports_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ReportTemplateRenderingTests(TestCase):
    """Test cases for report template rendering"""

    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com", name="Test User", password="testpass123"
        )
        self.project = Project.objects.create(
            name="Test Project", description="Test project description"
        )
        self.template = ReportTemplates.objects.create(
            template_name="Test Template",
            title="Test Report Title",
            project=self.project,
            created_by=self.user,
            address="123 Test Street, Test City",
            include_sales_revenue=True,
            include_impressions=True,
            include_impressions_revenue=True,
        )

    def test_template_rendering_with_data(self):
        """Test that the HTML template renders correctly with data"""
        context = {
            "project": self.project,
            "products": [
                {
                    "title": "Product 1",
                    "total_royalty": 500.00,
                    "total_impressions": 1000,
                    "impressions_revenue": 250.00,
                },
                {
                    "title": "Product 2",
                    "total_royalty": 300.00,
                    "total_impressions": 800,
                    "impressions_revenue": 150.00,
                },
            ],
            "total_royalty_sum": 1200.00,
            "user": self.user,
            "analytics": {"total_revenue": 1200},
            "period_start": date(2024, 1, 1),
            "period_end": date(2024, 12, 31),
            "created_at": datetime.now(),
            "template": self.template,
            "logo_url": None,
        }

        html_content = render_to_string("report_template.html", context)

        # Check that key elements are present in the rendered HTML
        self.assertIn("Test Report Title", html_content)
        self.assertIn("Test User", html_content)
        self.assertIn("Product 1", html_content)
        self.assertIn("Product 2", html_content)
        self.assertIn("$500.0", html_content)  # Product 1 royalty
        self.assertIn("$300.0", html_content)  # Product 2 royalty
        self.assertIn("$1200.00", html_content)  # Total sum
        self.assertIn("123 Test Street, Test City", html_content)
        self.assertIn("Jan. 1, 2024 - Dec. 31, 2024", html_content)

    def test_template_rendering_with_default_values(self):
        """Test template rendering with default values when optional fields are empty"""
        template_without_custom_fields = ReportTemplates.objects.create(
            template_name="Default Template", project=self.project, created_by=self.user
        )

        context = {
            "project": self.project,
            "products": [],
            "total_royalty_sum": 0,
            "user": self.user,
            "analytics": {},
            "period_start": None,
            "period_end": None,
            "created_at": datetime.now(),
            "template": template_without_custom_fields,
            "logo_url": None,
        }

        html_content = render_to_string("report_template.html", context)

        # Check that default values are used
        self.assertIn("Summary Royalty Statement", html_content)  # Default title
        self.assertIn("455 Moreland Ave #5836", html_content)  # Default address
        self.assertIn("Atlanta, GA 31107", html_content)  # Default address
        self.assertIn("trial-x-fire-logo.png", html_content)  # Default logo

    def test_template_conditional_rendering(self):
        """Test that template conditionally renders columns based on template"""
        # Template with only sales revenue enabled
        template_sales_only = ReportTemplates.objects.create(
            template_name="Sales Only Template",
            project=self.project,
            created_by=self.user,
            include_sales_revenue=True,
            include_impressions=False,
            include_impressions_revenue=False,
        )

        context = {
            "project": self.project,
            "products": [
                {
                    "title": "Product 1",
                    "total_royalty": 500.00,
                    "total_impressions": 1000,
                    "impressions_revenue": 250.00,
                }
            ],
            "total_royalty_sum": 500.00,
            "user": self.user,
            "analytics": {},
            "period_start": None,
            "period_end": None,
            "created_at": datetime.now(),
            "template": template_sales_only,
            "logo_url": None,
        }

        html_content = render_to_string("report_template.html", context)

        # Should include sales revenue column
        self.assertIn("Sales Revenue", html_content)
        # Should not include impressions columns
        self.assertNotIn("Impressions</b>", html_content)
        self.assertNotIn("Impressions Revenue", html_content)
