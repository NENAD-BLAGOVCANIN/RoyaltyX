from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.project.models import Project

from .models import ProjectInvite
from .serializers import (
    CreateInviteSerializer,
    InviteDetailsSerializer,
    ProjectInviteSerializer,
)
from .services import InviteService


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_invite(request):
    """Create a new project invite"""
    serializer = CreateInviteSerializer(data=request.data)
    if serializer.is_valid():
        try:
            # Get the current project
            project = get_object_or_404(Project, id=request.user.currently_selected_project_id)
            
            invite = InviteService.create_invite(
                project=project,
                email=serializer.validated_data['email'],
                role=serializer.validated_data['role'],
                invited_by=request.user,
                product_ids=serializer.validated_data.get('product_ids', [])
            )
            
            response_data = ProjectInviteSerializer(invite).data
            response_data['invite_link'] = f"{settings.APP_URL}/invite/{invite.id}"
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': 'Failed to create invite'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_invite_details(request, invite_id):
    """Get invite details (public endpoint for invite acceptance page)"""
    try:
        invite = get_object_or_404(ProjectInvite, id=invite_id)
        serializer = InviteDetailsSerializer(invite)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Invite not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_invite(request, invite_id):
    """Accept a project invite"""
    try:
        invite = get_object_or_404(ProjectInvite, id=invite_id)
        
        project_user = InviteService.accept_invite(invite, request.user)
        
        # Update user's currently selected project to the new project
        request.user.currently_selected_project = invite.project
        request.user.save()
        
        return Response({
            'message': 'Invite accepted successfully',
            'project_id': invite.project.id,
            'project_name': invite.project.name,
            'role': project_user.role
        }, status=status.HTTP_200_OK)
        
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': 'Failed to accept invite'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_pending_invites(request):
    """List all pending invites for the current project"""
    try:
        project = get_object_or_404(Project, id=request.user.currently_selected_project_id)
        invites = InviteService.get_pending_invites(project)
        serializer = ProjectInviteSerializer(invites, many=True)
        
        # Add invite links to each invite
        for invite_data in serializer.data:
            invite_data['invite_link'] = f"{settings.APP_URL}/invite/{invite_data['id']}"
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Failed to fetch invites'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cancel_invite(request, invite_id):
    """Cancel a pending invite"""
    try:
        InviteService.cancel_invite(invite_id, request.user)
        return Response({'message': 'Invite cancelled successfully'}, status=status.HTTP_200_OK)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': 'Failed to cancel invite'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resend_invite(request, invite_id):
    """Resend an invite email"""
    try:
        invite = get_object_or_404(ProjectInvite, id=invite_id, is_accepted=False)
        
        # Check if user has permission to resend
        from apps.project.models import ProjectUser
        user_project_role = ProjectUser.objects.filter(
            project=invite.project,
            user=request.user
        ).first()
        
        if not user_project_role or (user_project_role.role != "owner" and invite.invited_by != request.user):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        if invite.is_expired:
            return Response({'error': 'Cannot resend expired invite'}, status=status.HTTP_400_BAD_REQUEST)
        
        InviteService.send_invite_email(invite)
        
        return Response({'message': 'Invite email sent successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Failed to resend invite'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
