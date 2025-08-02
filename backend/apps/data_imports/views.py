from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import File
from .serializers import FileSerializer
from .services import create_file, delete_file, confirm_column_mappings
from .utils.column_mapping import get_expected_fields


class FileListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        files = File.objects.filter(
            project_id=request.user.currently_selected_project_id
        ).order_by("-created_at")

        serializer = FileSerializer(files, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        file = request.FILES.get("file")
        project_id = getattr(user, "currently_selected_project_id", None)

        data = request.data.copy()
        data["project"] = project_id

        try:
            response_data = create_file(file, data)
            return Response(response_data, status=status.HTTP_201_CREATED)

        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {"error": "An unexpected error occurred: " + str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class FileDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        file = get_object_or_404(File, pk=pk)
        serializer = FileSerializer(file)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        response_data = delete_file(pk)
        return Response(response_data, status=status.HTTP_200_OK)


class ColumnMappingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, file_id):
        """Confirm column mappings and process the file"""
        mappings = request.data.get('mappings', {})
        
        try:
            response_data = confirm_column_mappings(file_id, mappings)
            return Response(response_data, status=status.HTTP_200_OK)
        
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            return Response(
                {"error": "An unexpected error occurred: " + str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ExpectedFieldsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get the list of expected fields for column mapping"""
        expected_fields = get_expected_fields()
        
        # Transform to a more frontend-friendly format
        fields_list = []
        for field_key, possible_names in expected_fields.items():
            # Create custom descriptions for currency fields
            if field_key in ['unit_price_currency', 'royalty_currency']:
                description = f"Optional - defaults to USD. Maps to: {', '.join(possible_names[:3])}{'...' if len(possible_names) > 3 else ''}"
            else:
                description = f"Maps to: {', '.join(possible_names[:3])}{'...' if len(possible_names) > 3 else ''}"
            
            fields_list.append({
                'key': field_key,
                'label': field_key.replace('_', ' ').title(),
                'description': description
            })
        
        return Response({'fields': fields_list}, status=status.HTTP_200_OK)
