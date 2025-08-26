from django.db import models


class Project(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    members_can_see_other_members = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = "project"


class ProjectUser(models.Model):
    PROJECT_USER_ROLE_OWNER = "owner"
    PROJECT_USER_ROLE_PRODUCER = "producer"

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="project_users"
    )
    user = models.ForeignKey("user.User", on_delete=models.CASCADE)
    role = models.CharField(
        max_length=50,
        default="producer",
    )

    def __str__(self):
        return f"{self.user.username} - {self.project.name} ({self.role})"

    class Meta:
        unique_together = ("project", "user")
        db_table = "project_user"


class ProducerProductAccess(models.Model):
    """
    Model to handle which products a producer can access within a project.
    Only applies to users with 'producer' role.
    """
    project_user = models.ForeignKey(
        ProjectUser, 
        on_delete=models.CASCADE, 
        related_name="product_access"
    )
    product = models.ForeignKey(
        "product.Product", 
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.project_user.user.username} - {self.product.title}"

    class Meta:
        unique_together = ("project_user", "product")
        db_table = "producer_product_access"
