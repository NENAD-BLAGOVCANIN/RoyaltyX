# Generated by Django 5.0.6 on 2025-03-03 14:06

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("project", "0007_alter_projectuser_unique_together"),
    ]

    operations = [
        migrations.AlterField(
            model_name="projectuser",
            name="role",
            field=models.CharField(default="producer", max_length=50),
        ),
    ]
