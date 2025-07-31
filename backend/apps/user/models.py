from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models

from apps.project.models import Project


class MyUserManager(BaseUserManager):
    def create_user(self, email, name, password):
        if not email:
            raise ValueError("Users must have an email address.")
        if not name:
            raise ValueError("Users must have a name.")
        user = self.model(
            email=self.normalize_email(email),
            username=email,
            name=name,
            avatar=self.generate_avatar_url(name),
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password):
        user = self.create_user(
            email=self.normalize_email(email),
            name=name,
            password=password,
        )
        user.is_staff = True
        user.is_superuser = True
        return user

    def generate_avatar_url(self, name):
        """Generate a DiceBear avatar based on the user's name or username."""
        base_url = "https://api.dicebear.com/7.x/initials/svg"
        return f"{base_url}?seed={name}&backgroundColor=1976d2,9c0015,ffc107"


class User(AbstractBaseUser):
    ROLE_CHOICES = [
        ("user", "User"),
        ("admin", "Admin"),
    ]

    SUBSCRIPTION_PLAN_CHOICES = [
        ("free", "Free"),
        ("basic", "Basic"),
        ("premium", "Premium"),
    ]

    SUBSCRIPTION_STATUS_CHOICES = [
        ("inactive", "Inactive"),
        ("active", "Active"),
        ("past_due", "Past Due"),
        ("canceled", "Canceled"),
        ("incomplete", "Incomplete"),
    ]

    email = models.EmailField(max_length=60, unique=True, null=False)
    username = models.CharField(max_length=50, unique=True, null=False)
    name = models.CharField(max_length=30)
    last_login = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="user")
    date_joined = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    verification_code = models.CharField(max_length=30, null=True)
    verification_token_expiry = models.DateTimeField(null=True, blank=True)
    avatar = models.CharField(null=True, max_length=300)
    subscription_plan = models.CharField(
        max_length=10, choices=SUBSCRIPTION_PLAN_CHOICES, default="free"
    )
    # Stripe-related fields
    stripe_customer_id = models.CharField(max_length=255, null=True, blank=True)
    stripe_subscription_id = models.CharField(max_length=255, null=True, blank=True)
    subscription_status = models.CharField(
        max_length=50, choices=SUBSCRIPTION_STATUS_CHOICES, default="inactive"
    )
    subscription_current_period_end = models.DateTimeField(null=True, blank=True)
    grace_period_end = models.DateTimeField(null=True, blank=True)
    payment_failure_count = models.IntegerField(default=0)
    currently_selected_project = models.ForeignKey(
        Project, null=True, default=None, on_delete=models.CASCADE
    )

    objects = MyUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def has_module_perms(self, app_label):
        return True

    def has_perm(self, app_label):
        return True

    def __str__(self):
        return self.username

    class Meta:
        db_table = "user"
