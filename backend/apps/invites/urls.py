from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_invite, name='create_invite'),
    path('pending/', views.list_pending_invites, name='list_pending_invites'),
    path('<uuid:invite_id>/', views.get_invite_details, name='get_invite_details'),
    path('<uuid:invite_id>/accept/', views.accept_invite, name='accept_invite'),
    path('<uuid:invite_id>/cancel/', views.cancel_invite, name='cancel_invite'),
    path('<uuid:invite_id>/resend/', views.resend_invite, name='resend_invite'),
]
