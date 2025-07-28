# Generated manually to remove ProductUser model

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0010_alter_product_table_alter_productimpressions_table_and_more'),
    ]

    operations = [
        migrations.DeleteModel(
            name='ProductUser',
        ),
    ]
