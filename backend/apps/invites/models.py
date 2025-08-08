import uuid
from datetime import timedelta

from django.db import models
from django.utils import timezone


class ProjectInvite(models.Model):
    ROLE_CHOICES = [
        ("owner", "Owner"),
        ("producer", "Producer"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        "project.Project", on_delete=models.CASCADE, related_name="invites"
    )
    email = models.EmailField()
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default="producer")
    invited_by = models.ForeignKey(
        "user.User", on_delete=models.CASCADE, related_name="sent_invites"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_accepted = models.BooleanField(default=False)
    accepted_at = models.DateTimeField(null=True, blank=True)
    accepted_by = models.ForeignKey(
        "user.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="accepted_invites",
    )

    class Meta:
        db_table = "project_invite"

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"Invite {self.email} to {self.project.name}"


class InviteProductAccess(models.Model):
    invite = models.ForeignKey(
        ProjectInvite, on_delete=models.CASCADE, related_name="product_access"
    )
    product = models.ForeignKey("product.Product", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "invite_product_access"
        unique_together = ("invite", "product")

    def __str__(self):
        return f"{self.invite.email} -> {self.product.title}"
