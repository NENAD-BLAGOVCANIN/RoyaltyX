from django.conf import settings
from django.utils import timezone

from apps.emails.services import Email

from .models import InviteProductAccess, ProjectInvite


class InviteService:
    @staticmethod
    def create_invite(project, email, role, invited_by, product_ids=None):
        """Create invite and send email"""
        # Check if invite already exists for this project and email
        existing_invite = ProjectInvite.objects.filter(
            project=project, email=email, is_accepted=False
        ).first()

        if existing_invite and not existing_invite.is_expired:
            raise ValueError("An active invite already exists for this email address")

        # Delete expired invites for this project and email
        ProjectInvite.objects.filter(
            project=project, email=email, is_accepted=False
        ).delete()

        invite = ProjectInvite.objects.create(
            project=project, email=email, role=role, invited_by=invited_by
        )

        # Create product access records for producers
        if role == "producer" and product_ids:
            for product_id in product_ids:
                InviteProductAccess.objects.create(invite=invite, product_id=product_id)

        # Send email
        InviteService.send_invite_email(invite)

        return invite

    @staticmethod
    def send_invite_email(invite):
        """Send invite email"""
        invite_url = f"{settings.APP_URL}/invite/{invite.id}"

        # For now, send a simple HTML email. We can create a template later
        html_content = f"""
        <h2>You're invited to join {invite.project.name}</h2>
        <p>Hi there!</p>
        <p>{invite.invited_by.name} has invited you to join the project "{invite.project.name}" as a {invite.get_role_display()}.</p>
        <p><a href="{invite_url}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accept Invite</a></p>
        <p>Or copy and paste this link in your browser: {invite_url}</p>
        <p>This invite will expire on {invite.expires_at.strftime("%B %d, %Y at %I:%M %p")}.</p>
        <p>Best regards,<br>The RoyaltyX Team</p>
        """  # noqa: E501

        Email.send_html_email(
            subject=f"You're invited to join {invite.project.name}",
            html_content=html_content,
            recipient_list=[invite.email],
        )

    @staticmethod
    def accept_invite(invite, user):
        """Accept invite and create project membership"""
        from apps.project.models import ProducerProductAccess, ProjectUser

        # Validate email matches
        if user.email != invite.email:
            raise ValueError("Email address doesn't match the invite")

        # Check if already accepted
        if invite.is_accepted:
            raise ValueError("Invite has already been accepted")

        # Check if expired
        if invite.is_expired:
            raise ValueError("Invite has expired")

        # Check if user is already a member of this project
        existing_membership = ProjectUser.objects.filter(
            project=invite.project, user=user
        ).first()

        if existing_membership:
            raise ValueError("You are already a member of this project")

        # Create ProjectUser
        project_user = ProjectUser.objects.create(
            project=invite.project, user=user, role=invite.role
        )

        # Transfer product access for producers
        if invite.role == "producer":
            invite_products = InviteProductAccess.objects.filter(invite=invite)
            for invite_product in invite_products:
                ProducerProductAccess.objects.create(
                    project_user=project_user, product=invite_product.product
                )

        # Mark as accepted
        invite.is_accepted = True
        invite.accepted_at = timezone.now()
        invite.accepted_by = user
        invite.save()

        # Cleanup invite product access
        InviteProductAccess.objects.filter(invite=invite).delete()

        return project_user

    @staticmethod
    def get_pending_invites(project):
        """Get all pending invites for a project"""
        return (
            ProjectInvite.objects.filter(project=project, is_accepted=False)
            .select_related("invited_by")
            .prefetch_related("product_access__product")
        )

    @staticmethod
    def cancel_invite(invite_id, user):
        """Cancel a pending invite"""
        invite = ProjectInvite.objects.filter(id=invite_id, is_accepted=False).first()

        if not invite:
            raise ValueError("Invite not found or already accepted")

        # Only the inviter or project owner can cancel invites
        from apps.project.models import ProjectUser

        user_project_role = ProjectUser.objects.filter(
            project=invite.project, user=user
        ).first()

        if not user_project_role or (
            user_project_role.role != "owner" and invite.invited_by != user
        ):
            raise ValueError("You don't have permission to cancel this invite")

        invite.delete()
        return True
