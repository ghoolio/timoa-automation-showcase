# Workflow Blueprint: Weekly Salon Insights

## Purpose

Generate a weekly summary for a salon owner.

## Trigger

Weekly schedule.

## Metrics

- bookings
- cancellations
- top services
- payment method mix
- online paid revenue
- expected on-site value

## Steps

1. Query appointments for last 7 days.
2. Aggregate by status, service and payment method.
3. Build readable summary.
4. Send owner email or dashboard notification.
5. Log workflow execution.

## Privacy

Do not include customer names, emails, phone numbers or manage links.
