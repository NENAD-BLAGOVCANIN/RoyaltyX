from django.db import models

from apps.project.models import Project
from common.models import BaseModel


class File(BaseModel):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, null=True, blank=True
    )
    file = models.FileField(upload_to="uploads/", max_length=255, null=True)
    name = models.CharField(max_length=255, blank=True)
    is_processed = models.BooleanField(default=False)
    column_mappings = models.JSONField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.name and self.file:
            self.name = self.file.name
        super().save(*args, **kwargs)

    class Meta:
        db_table = "file"


class ColumnMapping(BaseModel):
    """Stores the mapping between CSV columns and our expected fields"""
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='mappings')
    csv_column = models.CharField(max_length=255)  # Column name from CSV
    mapped_field = models.CharField(max_length=255)  # Our expected field name
    
    class Meta:
        db_table = "column_mapping"
        unique_together = ['file', 'csv_column']
