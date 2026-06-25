# n8n Readiness and Workflow Mapping

## Important note

Timoa itself is not an n8n project. The production app is a full-stack TypeScript application.

This document shows how Timoa processes map to n8n-style automation work. It is intentionally honest: these are workflow blueprints and transferable implementation patterns, not exported production n8n workflows.

## Why Timoa is relevant for n8n roles

n8n work often involves:

- identifying repeated manual processes
- connecting tools through APIs and webhooks
- mapping and transforming JSON data
- using JavaScript code nodes for custom logic
- documenting workflows
- handling errors
- monitoring workflow execution
- respecting privacy and access rules

Timoa demonstrates these same fundamentals through custom application code.

## Example n8n-style workflows

### 1. New appointment workflow

Trigger:
- appointment.created event or webhook

Steps:
1. Validate appointment payload.
2. Fetch salon and service details.
3. Send customer confirmation email.
4. Send owner notification email.
5. Track safe analytics event.
6. Create internal log entry.

### 2. Payment completed workflow

Trigger:
- Stripe or PayPal payment completed webhook

Steps:
1. Verify provider event.
2. Match payment to appointment.
3. Update payment status.
4. Update appointment status if needed.
5. Send confirmation if not already sent.
6. Track payment_completed analytics event.

### 3. Cancellation manual review workflow

Trigger:
- online-paid appointment cancelled

Steps:
1. Detect payment method and status.
2. Mark refund as manual review needed.
3. Notify owner.
4. Notify customer with careful wording.
5. Add dashboard reminder.
6. Track safe event without customer PII.

### 4. Weekly insights workflow

Trigger:
- weekly schedule

Steps:
1. Query appointments for last 7 days.
2. Aggregate bookings, cancellations, payment methods and top services.
3. Create summary.
4. Send owner email or dashboard notification.
5. Log workflow result.

## Skills demonstrated

- API/webhook thinking
- event-driven workflow design
- JSON/data mapping
- error and status handling
- privacy-conscious metadata
- documentation and checklist discipline
