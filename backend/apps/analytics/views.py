from datetime import datetime, time

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.analytics.serializers import AnalyticsSerializer
from apps.analytics.utils import calculate_analytics


class AnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def _determine_granularity(self, period_start, period_end):
        """Determine appropriate granularity based on date range"""
        if not period_start or not period_end:
            return "max"

        delta = period_end - period_start

        if delta.days <= 1:
            return "daily" # TODO: Change to "hourly" after switching Date fields to DateTime
        elif delta.days <= 31:  # Approximately 1 month
            return "daily"
        elif delta.days <= 730:
            return "monthly"
        else:
            return "yearly"

    def get(self, request, product_id=None):
        serializer = AnalyticsSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        project_id = request.user.currently_selected_project_id
        period_start = serializer.validated_data.get("period_start", None)
        period_end = serializer.validated_data.get("period_end", None)

        filters = {}

        if period_start and period_end:
            start_date = datetime.combine(period_start, time.min)
            end_date = datetime.combine(period_end, time.max)
            filters["period_start__gte"] = start_date
            filters["period_end__lte"] = end_date

        granularity = self._determine_granularity(period_start, period_end)

        data = calculate_analytics(
            project_id, filters, period_start, period_end, product_id, granularity
        )

        return Response(data, status=status.HTTP_200_OK)
