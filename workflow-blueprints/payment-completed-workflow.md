# Workflow Blueprint: Payment Completed

## Purpose

Synchronize external payment provider events with internal appointment state.

## Trigger

Stripe or PayPal payment completed webhook.

## Steps

1. Verify provider event.
2. Extract provider payment/order ID.
3. Match internal payment record.
4. Update payment status.
5. Update appointment if needed.
6. Avoid duplicate fulfillment.
7. Track safe analytics event.

## n8n node mapping

- Webhook Trigger
- Code node for signature/status mapping
- Postgres/Supabase query
- IF node for already-paid check
- Postgres/Supabase update
- Error workflow for unmatched payment
