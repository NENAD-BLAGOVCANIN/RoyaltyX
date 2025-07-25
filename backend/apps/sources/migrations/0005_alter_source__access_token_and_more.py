# Generated by Django 5.0.6 on 2025-06-21 10:15

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("sources", "0004_remove_source_access_token_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="source",
            name="_access_token",
            field=models.TextField(
                blank=True, db_column="access_token", max_length=255, null=True
            ),
        ),
        migrations.AlterField(
            model_name="source",
            name="_refresh_token",
            field=models.TextField(
                blank=True, db_column="refresh_token", max_length=255, null=True
            ),
        ),
    ]
