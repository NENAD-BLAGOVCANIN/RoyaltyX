from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='verification_token_expiry',
            field=models.DateTimeField(null=True, blank=True),
        ),
    ]
