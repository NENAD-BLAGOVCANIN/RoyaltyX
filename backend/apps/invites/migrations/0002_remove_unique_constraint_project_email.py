# Generated manually to remove unique constraint on project and email

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('invites', '0001_initial'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='projectinvite',
            unique_together=set(),
        ),
    ]
