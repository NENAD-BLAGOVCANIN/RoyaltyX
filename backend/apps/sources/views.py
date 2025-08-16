from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.project.models import ProjectUser
from apps.sources.utils.tiktok_service import TikTokService
from apps.sources.utils.tiktok_sync import fetch_tiktok_stats, fetch_tiktok_videos
from apps.sources.utils.twitch_service import TwitchService
from apps.sources.utils.twitch_sync import fetch_twitch_stats, fetch_twitch_videos
from apps.sources.utils.vimeo_service import VimeoService
from apps.sources.utils.vimeo_sync import fetch_vimeo_videos_and_stats
from apps.sources.utils.instagram_service import InstagramService
from apps.sources.utils.instagram_sync import fetch_instagram_stats, fetch_instagram_videos

from .models import Source
from .serializers import SourceSerializer
from .utils.youtube import (
    fetch_youtube_channel_details,
    fetch_youtube_stats,
    fetch_youtube_videos,
)


class SourceListCreateView(APIView):
    """
    GET: Returns a list of sources for this project.
    POST: Create a new source
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        sources = Source.objects.filter(
            project_id=request.user.currently_selected_project_id
        )
        serializer = SourceSerializer(sources, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=SourceSerializer,
    )
    def post(self, request):
        try:
            project_user = ProjectUser.objects.get(
                user=request.user,
                project_id=request.user.currently_selected_project_id
            )
            if project_user.role == ProjectUser.PROJECT_USER_ROLE_PRODUCER:
                return Response(
                    {"detail": "Producers are not allowed to add new sources."},
                    status=status.HTTP_403_FORBIDDEN
                )
        except ProjectUser.DoesNotExist:
            return Response(
                {"detail": "You are not a member of this project."},
                status=status.HTTP_403_FORBIDDEN
            )

        data = request.data.copy()
        data["project"] = request.user.currently_selected_project_id
        serializer = SourceSerializer(data=data)
        if serializer.is_valid():
            source = serializer.save()

            # For YouTube sources, fetch and store the channel ID and name
            if source.platform == Source.PLATFORM_YOUTUBE and source.access_token:
                try:
                    channel_details = fetch_youtube_channel_details(source.access_token)
                    source.channel_id = channel_details["id"]
                    source.account_name = channel_details["name"]
                    source.save(update_fields=["channel_id", "account_name"])
                except Exception as e:
                    print(f"Failed to fetch YouTube channel details: {e}")
                    # Continue without channel details.
                    # The fetch functions will skip this source.

                fetch_youtube_videos(source.id)
                fetch_youtube_stats(source.id)

            elif source.platform == Source.PLATFORM_TIKTOK and source.access_token:
                try:
                    service = TikTokService(source.access_token)
                    channel_details = service.fetch_user_info()
                    source.channel_id = channel_details["open_id"]
                    source.account_name = (
                        channel_details.get("display_name") or "TikTok User"
                    )
                    source.save(update_fields=["channel_id", "account_name"])
                except Exception as e:
                    print(f"Failed to fetch Tiktok channel details: {e}")

                fetch_tiktok_videos(source.id)
                fetch_tiktok_stats(source.id)

            elif source.platform == Source.PLATFORM_TWITCH and source.access_token:
                try:
                    service = TwitchService(source.access_token)
                    channel_details = service.fetch_user_info()
                    source.channel_id = channel_details["id"]
                    source.account_name = (
                        channel_details.get("display_name") or "Twitch User"
                    )
                    source.save(update_fields=["channel_id", "account_name"])
                except Exception as e:
                    print(f"Failed to fetch Twitch channel details: {e}")

                fetch_twitch_videos(source.id)
                fetch_twitch_stats(source.id)

            elif source.platform == Source.PLATFORM_VIMEO and source.access_token:
                if not source.channel_id:
                    try:
                        service = VimeoService(source.access_token)
                        channel_details = service.fetch_user_info()
                        source.channel_id = channel_details["user_id"]
                        source.account_name = (
                            channel_details.get("display_name") or "Vimeo User"
                        )
                        source.save(update_fields=["channel_id", "account_name"])
                    except Exception as e:
                        print(f"Failed to fetch Vimeo channel details: {e}")

                fetch_vimeo_videos_and_stats(source.id)

            elif source.platform == Source.PLATFORM_INSTAGRAM and source.access_token:
                try:
                    service = InstagramService(source.access_token)
                    channel_details = service.fetch_user_info()
                    source.channel_id = channel_details["id"]
                    source.account_name = channel_details.get("username") or "Instagram User"
                    source.save(update_fields=["channel_id", "account_name"])
                except Exception as e:
                    print(f"Failed to fetch Instagram channel details: {e}")
                
                fetch_instagram_videos(source.id)
                fetch_instagram_stats(source.id)

            return Response(
                SourceSerializer(source).data, status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProjectRoleView(APIView):
    """
    GET: Returns the current user's role in the currently selected project
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            project_user = ProjectUser.objects.get(
                user=request.user,
                project_id=request.user.currently_selected_project_id
            )
            return Response({
                "role": project_user.role,
                "can_add_sources": project_user.role != ProjectUser.PROJECT_USER_ROLE_PRODUCER
            }, status=status.HTTP_200_OK)
        except ProjectUser.DoesNotExist:
            return Response(
                {"detail": "You are not a member of this project."},
                status=status.HTTP_403_FORBIDDEN
            )


class SourceDetailView(APIView):
    """
    GET: Returns a single source
    PUT: Update a source
    DELETE: Delete a source
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            source = Source.objects.get(
                pk=pk, project_id=request.user.currently_selected_project_id
            )
            serializer = SourceSerializer(source)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Source.DoesNotExist:
            return Response(
                {"detail": "Source not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @extend_schema(
        request=SourceSerializer,
    )
    def put(self, request, pk):
        try:
            source = Source.objects.get(
                pk=pk, project_id=request.user.currently_selected_project_id
            )
            serializer = SourceSerializer(source, data=request.data, partial=True)
            if serializer.is_valid():
                updated_source = serializer.save()
                return Response(
                    SourceSerializer(updated_source).data, status=status.HTTP_200_OK
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Source.DoesNotExist:
            return Response(
                {"detail": "Source not found"}, status=status.HTTP_404_NOT_FOUND
            )

    def delete(self, request, pk):
        try:
            source = Source.objects.get(
                pk=pk, project_id=request.user.currently_selected_project_id
            )
            source.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Source.DoesNotExist:
            return Response(
                {"detail": "Source not found"}, status=status.HTTP_404_NOT_FOUND
            )
