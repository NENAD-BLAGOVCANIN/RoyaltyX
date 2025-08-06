import random
import string

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.project.models import Project, ProjectUser

User = get_user_model()


class ProjectUserListViewTests(TestCase):
    def setUp(self):
        """Set up test data for each test method"""
        self.client = APIClient()

        # Create test users
        random_number = "".join(random.choices(string.digits, k=4))
        self.owner_email = f"owner_{random_number}@test.com"
        self.user_email = f"user_{random_number}@test.com"
        self.another_user_email = f"another_user_{random_number}@test.com"

        self.owner = User.objects.create_user(
            email=self.owner_email, name="Project Owner", password="TestPassword123_"
        )

        self.user_to_add = User.objects.create_user(
            email=self.user_email, name="User To Add", password="TestPassword123_"
        )

        self.another_user = User.objects.create_user(
            email=self.another_user_email,
            name="Another User",
            password="TestPassword123_",
        )

        # Create test projects
        self.project1 = Project.objects.create(
            name="Test Project 1", description="First test project"
        )

        self.project2 = Project.objects.create(
            name="Test Project 2", description="Second test project"
        )

        # Set up project ownership
        ProjectUser.objects.create(
            project=self.project1,
            user=self.owner,
            role=ProjectUser.PROJECT_USER_ROLE_OWNER,
        )

        # Set the owner's currently selected project
        self.owner.currently_selected_project = self.project1
        self.owner.save()

        # URL for adding users to project
        self.add_user_url = reverse("project-user-list")

    def test_add_user_without_role_uses_default(self):
        """Test adding a user without specifying role uses default 'producer'"""
        self.client.force_authenticate(user=self.owner)

        data = {"user": self.user_to_add.id}

        response = self.client.post(self.add_user_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data["role"], ProjectUser.PROJECT_USER_ROLE_PRODUCER
        )  # Default role producer

    def test_add_user_missing_user_field(self):
        """Test adding user fails when user field is missing"""
        self.client.force_authenticate(user=self.owner)

        data = {}

        response = self.client.post(self.add_user_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("user", response.data)

    def test_add_user_invalid_user_id(self):
        """Test adding user fails with invalid user ID"""
        self.client.force_authenticate(user=self.owner)

        data = {
            "user": 99999,  # Non-existent user ID
        }

        response = self.client.post(self.add_user_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("user", response.data)

    def test_add_duplicate_user_to_project(self):
        """Test adding the same user twice to the same project fails"""
        self.client.force_authenticate(user=self.owner)

        # First, add the user successfully
        data = {
            "user": self.user_to_add.id,
        }

        response = self.client.post(self.add_user_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Try to add the same user again
        response = self.client.post(self.add_user_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_project_field_automatically_set_from_currently_selected_project(self):
        """Test that project field is automatically set from user's selected project"""
        self.client.force_authenticate(user=self.owner)

        data = {
            "user": self.user_to_add.id,
        }

        response = self.client.post(self.add_user_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["project"], self.project1.id)

        # Verify in database
        project_user = ProjectUser.objects.get(
            user=self.user_to_add, project=self.project1
        )
        self.assertEqual(project_user.project.id, self.project1.id)


class ProjectUserViewDeleteTests(TestCase):
    def setUp(self):
        """Set up test data for each test method"""
        self.client = APIClient()

        # Create test users
        random_number = "".join(random.choices(string.digits, k=4))
        self.owner_email = f"owner_{random_number}@test.com"
        self.user_email = f"user_{random_number}@test.com"

        self.owner = User.objects.create_user(
            email=self.owner_email, name="Project Owner", password="TestPassword123_"
        )

        self.user_to_remove = User.objects.create_user(
            email=self.user_email, name="User To Remove", password="TestPassword123_"
        )

        # Create test project
        self.project = Project.objects.create(
            name="Test Project", description="Test project for deletion tests"
        )

        # Create ProjectUser relationships
        self.owner_project_user = ProjectUser.objects.create(
            project=self.project,
            user=self.owner,
            role=ProjectUser.PROJECT_USER_ROLE_OWNER,
        )

        self.project_user_to_delete = ProjectUser.objects.create(
            project=self.project,
            user=self.user_to_remove,
            role=ProjectUser.PROJECT_USER_ROLE_PRODUCER,
        )

    def test_successful_delete_project_user(self):
        """Test successfully deleting a ProjectUser"""
        self.client.force_authenticate(user=self.owner)

        delete_url = reverse(
            "project-user", kwargs={"id": self.project_user_to_delete.id}
        )

        response = self.client.delete(delete_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(response.data["message"], "ProjectUser deleted successfully")

        # Verify the ProjectUser was deleted from the database
        with self.assertRaises(ProjectUser.DoesNotExist):
            ProjectUser.objects.get(id=self.project_user_to_delete.id)

    def test_delete_nonexistent_project_user(self):
        """Test deleting a ProjectUser that doesn't exist returns 404"""
        self.client.force_authenticate(user=self.owner)

        nonexistent_id = 99999
        delete_url = reverse("project-user", kwargs={"id": nonexistent_id})

        response = self.client.delete(delete_url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
