from django.db import models

from common.models import BaseModel


class Expense(BaseModel):
    TYPE_PERCENTAGE = "percentage"
    TYPE_STATIC = "static"
    
    TYPE_CHOICES = [
        (TYPE_PERCENTAGE, "Percentage"),
        (TYPE_STATIC, "Static Amount"),
    ]
    
    name = models.CharField(max_length=255)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default=TYPE_STATIC
    )
    user = models.ForeignKey(
        "user.User", 
        on_delete=models.CASCADE,
        related_name="expenses"
    )
    product = models.ForeignKey(
        "product.Product", 
        on_delete=models.CASCADE,
        related_name="expenses"
    )
    project = models.ForeignKey(
        "project.Project", 
        on_delete=models.CASCADE,
        related_name="expenses"
    )

    def __str__(self):
        return f"{self.name} - {self.project.name}"

    class Meta:
        db_table = "expense"
        ordering = ["-created_at"]
