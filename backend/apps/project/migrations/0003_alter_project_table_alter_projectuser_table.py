# Generated by Django 5.0.6 on 2025-01-02 00:53

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("project", "0002_initial"),
    ]

    operations = [
        migrations.AlterModelTable(
            name="project",
            table="project",
        ),
        migrations.AlterModelTable(
            name="projectuser",
            table="project_user",
        ),
    ]
