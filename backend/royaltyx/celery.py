import os

from celery import Celery
from django.conf import settings

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "royaltyx.settings")

app = Celery("royaltyx")

app.config_from_object("django.conf:settings", namespace="CELERY")

app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)
app.autodiscover_tasks()
