import random
import string

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient


class SubscriptionPlanTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.User = get_user_model()
        
        # Create a test user
        random_number = "".join(random.choices(string.digits, k=4))
        self.email = f"test_user_{random_number}@test.com"
        self.password = "Testaccount1_"
        self.name = "Test User"
        
        self.user = self.User.objects.create_user(
            email=self.email,
            name=self.name,
            password=self.password
        )
        
        # Login to get authentication token
        login_url = reverse("token_obtain_pair")
        login_data = {"email": self.email, "password": self.password}
        response = self.client.post(login_url, login_data, format="json")
        self.access_token = response.data["access"]
        
        # Set authentication header
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def test_user_default_subscription_plan(self):
        """Test that new users have 'free' as default subscription plan"""
        self.assertEqual(self.user.subscription_plan, "free")

    def test_get_subscription_plan(self):
        """Test getting current user's subscription plan"""
        url = reverse("user.get_subscription_plan")
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["subscription_plan"], "free")

    def test_get_available_plans(self):
        """Test getting all available subscription plans"""
        url = reverse("user.get_available_plans")
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("plans", response.data)
        
        expected_plans = [
            {"value": "free", "label": "Free"},
            {"value": "basic", "label": "Basic"},
            {"value": "premium", "label": "Premium"}
        ]
        self.assertEqual(response.data["plans"], expected_plans)

    def test_change_subscription_plan_to_basic(self):
        """Test changing subscription plan to basic"""
        url = reverse("user.change_subscription_plan")
        data = {"subscription_plan": "basic"}
        response = self.client.post(url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["subscription_plan"], "basic")
        self.assertIn("successfully changed to basic", response.data["message"])
        
        # Verify the change in database
        self.user.refresh_from_db()
        self.assertEqual(self.user.subscription_plan, "basic")

    def test_change_subscription_plan_to_premium(self):
        """Test changing subscription plan to premium"""
        url = reverse("user.change_subscription_plan")
        data = {"subscription_plan": "premium"}
        response = self.client.post(url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["subscription_plan"], "premium")
        self.assertIn("successfully changed to premium", response.data["message"])
        
        # Verify the change in database
        self.user.refresh_from_db()
        self.assertEqual(self.user.subscription_plan, "premium")

    def test_change_subscription_plan_invalid_plan(self):
        """Test changing subscription plan with invalid plan name"""
        url = reverse("user.change_subscription_plan")
        data = {"subscription_plan": "invalid_plan"}
        response = self.client.post(url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Check if it's a validation error from the serializer
        if "subscription_plan" in response.data:
            self.assertTrue(len(response.data["subscription_plan"]) > 0)
        elif "error" in response.data:
            self.assertIn("Invalid subscription plan", response.data["error"])

    def test_change_subscription_plan_unauthenticated(self):
        """Test that unauthenticated users cannot change subscription plans"""
        # Remove authentication
        self.client.credentials()
        
        url = reverse("user.change_subscription_plan")
        data = {"subscription_plan": "basic"}
        response = self.client.post(url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_subscription_plan_unauthenticated(self):
        """Test that unauthenticated users cannot get subscription plans"""
        # Remove authentication
        self.client.credentials()
        
        url = reverse("user.get_subscription_plan")
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_subscription_plan_in_user_info(self):
        """Test that subscription plan is included in user info"""
        url = reverse("user.getMyUserInfo")
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("subscription_plan", response.data)
        self.assertEqual(response.data["subscription_plan"], "free")
