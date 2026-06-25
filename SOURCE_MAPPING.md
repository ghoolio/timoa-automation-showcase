# Source mapping

These public code samples are cleaned excerpts or representative samples based on the uploaded private Timoa files.

| Public sample | Based on private source |
|---|---|
| `code-samples/prisma-schema-excerpt.prisma` | `prisma/schema.prisma` |
| `code-samples/booking-workflow-state.ts` | `components/booking/booking-flow.tsx` |
| `code-samples/booking-validation.ts` | `app/api/appointments/route.ts` |
| `code-samples/availability-check.ts` | `app/api/availability/route.ts` |
| `code-samples/create-appointment-action.ts` | `app/api/appointments/route.ts` |
| `code-samples/payment-status-mapping.ts` | `lib/payments/payment-status.ts`, `lib/payments/payment-return-status.ts` |
| `code-samples/webhook-event-normalizer.ts` | `app/api/paypal/webhook/route.ts`, `app/api/stripe/webhook/route.ts`, `lib/payments/paypal-webhook.ts`, `lib/payments/paypal-fulfillment.ts` |
| `code-samples/insights-aggregation.ts` | `lib/insights/salon-insights.ts` |
| `code-samples/owner-onboarding-steps.ts` | `lib/onboarding/setup.ts` |
| `code-samples/automation-event-contract.ts` | `lib/analytics/event-registry.ts`, `lib/analytics/track-event.ts` |

The public files intentionally omit private deployment details, raw provider payloads and customer records.
