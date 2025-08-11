from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from apps.invites.models import ProjectInvite
from apps.invites.services import InviteService
from apps.project.models import Project, ProjectUser

User = get_user_model()


class ProjectInviteTestCase(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            username="testuser1",
            email="test1@example.com",
            password="testpass123"
        )
        self.user2 = User.objects.create_user(
            username="testuser2", 
            email="test2@example.com",
            password="testpass123"
        )
        self.project = Project.objects.create(
            name="Test Project",
            description="A test project"
        )
        # Make user1 the project owner
        ProjectUser.objects.create(
            project=self.project,
            user=self.user1,
            role="owner"
        )

    def test_multiple_invites_same_email_allowed(self):
        """Test that multiple invites can be created for the same email"""
        email = "invite@example.com"
        
        # Create first invite
        invite1 = InviteService.create_invite(
            project=self.project,
            email=email,
            role="producer",
            invited_by=self.user1
        )
        
        # Create second invite for same email - should succeed
        invite2 = InviteService.create_invite(
            project=self.project,
            email=email,
            role="producer", 
            invited_by=self.user1
        )
        
        # Both invites should exist
        self.assertIsNotNone(invite1)
        self.assertIsNotNone(invite2)
        self.assertNotEqual(invite1.id, invite2.id)
        
        # Check that both invites exist in database
        invites = ProjectInvite.objects.filter(project=self.project, email=email)
        self.assertEqual(invites.count(), 2)

    def test_expired_invites_cleaned_up(self):
        """Test that expired invites are cleaned up when creating new ones"""
        email = "invite@example.com"
        
        # Create an expired invite
        expired_invite = ProjectInvite.objects.create(
            project=self.project,
            email=email,
            role="producer",
            invited_by=self.user1,
            expires_at=timezone.now() - timedelta(days=1)  # Expired
        )
        
        # Create a new invite - should clean up the expired one
        new_invite = InviteService.create_invite(
            project=self.project,
            email=email,
            role="producer",
            invited_by=self.user1
        )
        
        # Expired invite should be deleted
        self.assertFalse(
            ProjectInvite.objects.filter(id=expired_invite.id).exists()
        )
        
        # New invite should exist
        self.assertTrue(
            ProjectInvite.objects.filter(id=new_invite.id).exists()
        )

    def test_project_user_uniqueness_maintained(self):
        """Test that ProjectUser uniqueness is still enforced"""
        # Try to create duplicate ProjectUser - should fail
        with self.assertRaises(Exception):
            ProjectUser.objects.create(
                project=self.project,
                user=self.user1,  # user1 is already a member
                role="producer"
            )

    def test_accept_invite_prevents_duplicate_membership(self):
        """Test that accepting an invite doesn't create duplicate membership"""
        email = self.user2.email
        
        # Create invite for user2
        invite = InviteService.create_invite(
            project=self.project,
            email=email,
            role="producer",
            invited_by=self.user1
        )
        
        # Accept the invite
        project_user = InviteService.accept_invite(invite, self.user2)
        self.assertIsNotNone(project_user)
        
        # Create another invite for the same user
        invite2 = InviteService.create_invite(
            project=self.project,
            email=email,
            role="producer",
            invited_by=self.user1
        )
        
        # Trying to accept the second invite should fail
        with self.assertRaises(ValueError) as context:
            InviteService.accept_invite(invite2, self.user2)
        
        self.assertIn("already a member", str(context.exception))
        
        # Should still only have one ProjectUser for this user
        project_users = ProjectUser.objects.filter(
            project=self.project, 
            user=self.user2
        )
        self.assertEqual(project_users.count(), 1)

    def test_multiple_pending_invites_same_email(self):
        """Test that multiple pending invites for same email are handled correctly"""
        email = "pending@example.com"
        
        # Create multiple invites
        InviteService.create_invite(
            project=self.project,
            email=email,
            role="producer",
            invited_by=self.user1
        )
        
        InviteService.create_invite(
            project=self.project,
            email=email,
            role="owner",  # Different role
            invited_by=self.user1
        )
        
        # Both should be pending
        pending_invites = ProjectInvite.objects.filter(
            project=self.project,
            email=email,
            is_accepted=False
        )
        self.assertEqual(pending_invites.count(), 2)
        
        # Get pending invites through service
        all_pending = InviteService.get_pending_invites(self.project)
        email_invites = [inv for inv in all_pending if inv.email == email]
        self.assertEqual(len(email_invites), 2)
