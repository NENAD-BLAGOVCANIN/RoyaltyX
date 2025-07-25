from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification
from .serializers import NotificationSerializer


class UserNotificationView(APIView):
    """
    GET: List notifications
    POST: Mark notifications as read.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user).order_by(
            "-created_at"
        )
        serializer = NotificationSerializer(notifications, many=True)
        unread_count = notifications.filter(is_read=False).count()

        data = {
            "unread_count": unread_count,
            "notifications": serializer.data,
        }

        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        """
        Mark all unread notifications as read
        """
        Notification.objects.filter(user=request.user, is_read=False).update(
            is_read=True
        )
        return Response(status=status.HTTP_200_OK)
