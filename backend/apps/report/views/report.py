import uuid
from datetime import datetime, time

from django.core.files.base import ContentFile
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.timezone import now
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from weasyprint import HTML

from apps.analytics.utils import calculate_analytics
from apps.notifications.utils import create_notification
from apps.product.models import Product
from apps.project.models import ProducerProductAccess, Project, ProjectUser
from apps.report.models import Report
from apps.report.serializers import ReportRequestSerializer, ReportSerializer


class ReportsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        currently_selected_project_id = user.currently_selected_project_id
        reports = Report.objects.filter(
            project_id=currently_selected_project_id, created_by=request.user
        ).order_by("-created_at")
        serializer = ReportSerializer(reports, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        currently_selected_project_id = request.user.currently_selected_project_id
        serializer = ReportRequestSerializer(
            data=request.query_params,
            context={"project_id": currently_selected_project_id},
        )
        serializer.is_valid(raise_exception=True)
        period_start = serializer.validated_data.get("period_start", None)
        period_end = serializer.validated_data.get("period_end", None)
        template = serializer.validated_data.get("template", None)

        filters = {}

        start_date = None
        end_date = None

        if period_start and period_end:
            try:
                start_date = timezone.make_aware(
                    datetime.combine(period_start, time.min)
                )
                end_date = timezone.make_aware(datetime.combine(period_end, time.max))
                filters["period_start__gte"] = start_date
                filters["period_end__lte"] = end_date
            except ValueError:
                return Response(
                    {"error": "Invalid date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        user = request.user

        analytics = calculate_analytics(
            currently_selected_project_id, filters, period_start, period_end, user=user
        )

        project = Project.objects.get(id=currently_selected_project_id)

        # Apply role-based filtering to products
        products = Product.objects.filter(project=project)
        try:
            project_user = ProjectUser.objects.get(
                user=user, project_id=currently_selected_project_id
            )
            if project_user.role == ProjectUser.PROJECT_USER_ROLE_PRODUCER:
                # Get accessible product IDs for this producer
                accessible_product_ids = list(
                    ProducerProductAccess.objects.filter(
                        project_user=project_user
                    ).values_list("product_id", flat=True)
                )

                # Filter products to only accessible ones
                products = products.filter(id__in=accessible_product_ids)
        except ProjectUser.DoesNotExist:
            # User is not a member of this project, return empty products
            products = products.none()

        product_data = []
        total_royalty_sum = 0

        for product in products:
            total_royalty = product.total_royalty_earnings(start_date, end_date)
            total_impressions = product.total_impressions(start_date, end_date)
            impressions_revenue = product.impressions_revenue(start_date, end_date)

            total_royalty_sum += total_royalty
            total_royalty_sum += impressions_revenue

            product_data.append(
                {
                    "title": product.title,
                    "total_royalty": total_royalty,
                    "total_impressions": total_impressions,
                    "impressions_revenue": impressions_revenue,
                }
            )

        filename = f"rx_report_{uuid.uuid4().hex}.pdf"
        context = {
            "project": project,
            "products": product_data,
            "total_royalty_sum": total_royalty_sum,
            "user": user,
            "analytics": analytics,
            "period_start": period_start,
            "period_end": period_end,
            "created_at": now(),
            "template": template,
            "logo_url": template.logo_absolute_url(request),
        }

        html_content = render_to_string("report_template.html", context)
        pdf_file = HTML(string=html_content).write_pdf()

        report = Report.objects.create(
            template=template,
            filename=filename,
            project_id=currently_selected_project_id,
            created_by=user,
            period_start=period_start,
            period_end=period_end,
        )
        report.file.save(filename, ContentFile(pdf_file))

        create_notification(user, "Your requested report was successfully created!")

        serializer = ReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
