# Generated by Django 5.0.6 on 2025-03-20 23:07

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("user", "0003_user_avatar"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="avatar",
            field=models.CharField(null=True),
        ),
    ]
