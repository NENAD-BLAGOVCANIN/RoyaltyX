import logging
import secrets
import string
from datetime import datetime, timedelta
from django.utils import timezone

from .services import Email

logger = logging.getLogger(__name__)


def send_welcome_email(
    user_email: str, user_name: str
) -> bool:
    """
    Send a welcome email to a new user.

    Args:
        user_email: The email address of the new user
        user_name: The name of the new user
        dashboard_url: URL to the user dashboard (optional)

    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:    
        dashboard_url = "https://app.royaltyx.co/"
        subject = "Welcome to RoyaltyX!"

        context = {
            "user_name": user_name,
            "dashboard_url": dashboard_url,
        }

        success = Email.send_template_email(
            subject=subject,
            template_name="emails/welcome.html",
            context=context,
            recipient_list=[user_email],
            fail_silently=False,
        )

        if success:
            logger.info(f"Welcome email sent successfully to {user_email}")
        else:
            logger.error(f"Failed to send welcome email to {user_email}")

        return success

    except Exception as e:
        logger.error(f"Error sending welcome email to {user_email}: {str(e)}")
        return False


def generate_verification_code(length: int = 6) -> str:
    """
    Generate a random verification code.
    
    Args:
        length: Length of the verification code
        
    Returns:
        str: Random verification code
    """
    return ''.join(secrets.choice(string.digits) for _ in range(length))


def send_email_confirmation(
    user_email: str, 
    user_name: str, 
    verification_code: str,
    verification_link: str
) -> bool:
    """
    Send an email confirmation message to a user.

    Args:
        user_email: The email address of the user
        user_name: The name of the user
        verification_code: The verification code
        verification_link: The verification link

    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:
        subject = "Confirm Your Email Address - RoyaltyX"

        context = {
            "user_name": user_name,
            "verification_code": verification_code,
            "verification_link": verification_link,
        }

        success = Email.send_template_email(
            subject=subject,
            template_name="emails/email_confirmation.html",
            context=context,
            recipient_list=[user_email],
            fail_silently=False,
        )

        if success:
            logger.info(f"Email confirmation sent successfully to {user_email}")
        else:
            logger.error(f"Failed to send email confirmation to {user_email}")

        return success

    except Exception as e:
        logger.error(f"Error sending email confirmation to {user_email}: {str(e)}")
        return False
