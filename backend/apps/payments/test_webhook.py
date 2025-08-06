import json

from django.contrib.auth import get_user_model
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .stripe_service import StripeService

User = get_user_model()


@csrf_exempt
@require_POST
def test_webhook(request):
    """Test webhook endpoint that bypasses signature verification"""
    try:
        payload = json.loads(request.body)
        event_type = payload.get("type")

        print(f"Received webhook event: {event_type}")

        if event_type == "checkout.session.completed":
            session = payload["data"]["object"]
            print(f"Processing checkout session: {session.get('id')}")

            # Handle the successful payment
            try:
                user = StripeService.handle_successful_payment(session)
                print(
                    f"Successfully updated user {user.email} to plan {user.subscription_plan}"
                )
            except Exception as e:
                print(f"Error handling successful payment: {str(e)}")

        elif event_type == "invoice.payment_failed":
            invoice = payload["data"]["object"]
            print(f"Processing failed payment: {invoice.get('id')}")

            try:
                user = StripeService.handle_payment_failed(invoice)
                print(f"Updated user {user.email} status to {user.subscription_status}")
            except Exception as e:
                print(f"Error handling payment failure: {str(e)}")

        elif event_type == "customer.subscription.deleted":
            subscription = payload["data"]["object"]
            print(f"Processing subscription deletion: {subscription.get('id')}")

            try:
                user = StripeService.handle_subscription_deleted(subscription)
                print(f"Downgraded user {user.email} to free plan")
            except Exception as e:
                print(f"Error handling subscription deletion: {str(e)}")

        return HttpResponse(status=200)

    except Exception as e:
        print(f"Webhook error: {str(e)}")
        return HttpResponse(status=500)
