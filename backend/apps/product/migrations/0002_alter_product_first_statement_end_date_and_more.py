# Generated by Django 5.0.6 on 2025-02-16 19:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='first_statement_end_date',
            field=models.DateField(null=True),
        ),
        migrations.AlterField(
            model_name='product',
            name='statement_frequency',
            field=models.CharField(choices=[('Monthly', 'Monthly'), ('Quarterly', 'Quarterly'), ('Annually', 'Annually')], max_length=50, null=True),
        ),
    ]
