# Generated by Django 5.0.6 on 2025-04-06 22:12

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("user", "0004_alter_user_avatar"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="avatar",
            field=models.CharField(max_length=300, null=True),
        ),
    ]
