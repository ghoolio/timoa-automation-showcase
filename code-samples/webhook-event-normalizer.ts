/**
 * Cleaned representative excerpt based on Timoa's Stripe and PayPal webhook handling.
 * Provider verification and raw provider payloads are intentionally omitted from this public sample.
 */

import { mapProviderPaymentStatus, paymentProviders, type InternalPaymentStatus } from "./payment-status-mapping";

export type PaymentProvider = (typeof paymentProviders)[keyof typeof paymentProviders];

export type NormalizedPaymentEvent = {
  provider: PaymentProvider;
  eventId: string | null;
  eventType: string;
  paymentId: string | null;
  appointmentId: string | null;
  providerOrderId: string | null;
  providerCaptureId: string | null;
  providerCheckoutSessionId: string | null;
  amountCents: number | null;
  currency: string | null;
  internalStatus: InternalPaymentStatus;
};

type PayPalResource = {
  id?: string;
  status?: string;
  custom_id?: string;
  invoice_id?: string;
  amount?: { value?: string; currency_code?: string };
  supplementary_data?: { related_ids?: { order_id?: string } };
};

type PayPalWebhookEvent = {
  id?: string;
  event_type?: string;
  resource?: PayPalResource;
};

type StripeCheckoutSession = {
  id: string;
  payment_status?: string | null;
  status?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  metadata?: {
    paymentId?: string;
    appointmentId?: string;
    salonId?: string;
  } | null;
};

function centsFromDecimalString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : null;
}

function normalizeProviderStatus(value: string | null | undefined) {
  const status = value?.toLowerCase();

  if (
    status === "completed" ||
    status === "captured" ||
    status === "succeeded" ||
    status === "failed" ||
    status === "denied" ||
    status === "cancelled" ||
    status === "expired" ||
    status === "pending" ||
    status === "created" ||
    status === "approved"
  ) {
    return status;
  }

  return "pending";
}

export function normalizePayPalWebhook(event: PayPalWebhookEvent): NormalizedPaymentEvent {
  const resource = event.resource ?? {};
  const relatedOrderId = resource.supplementary_data?.related_ids?.order_id ?? null;
  const providerStatus = normalizeProviderStatus(resource.status);

  return {
    provider: paymentProviders.paypal,
    eventId: event.id ?? null,
    eventType: event.event_type ?? "unknown",
    paymentId: resource.custom_id ?? resource.invoice_id ?? null,
    appointmentId: null,
    providerOrderId: relatedOrderId,
    providerCaptureId: resource.id ?? null,
    providerCheckoutSessionId: null,
    amountCents: centsFromDecimalString(resource.amount?.value),
    currency: resource.amount?.currency_code?.toLowerCase() ?? null,
    internalStatus: mapProviderPaymentStatus(providerStatus),
  };
}

export function normalizeStripeCheckoutCompleted(session: StripeCheckoutSession): NormalizedPaymentEvent {
  const providerStatus = normalizeProviderStatus(session.payment_status ?? session.status ?? undefined);

  return {
    provider: paymentProviders.stripe,
    eventId: session.id,
    eventType: "checkout.session.completed",
    paymentId: session.metadata?.paymentId ?? null,
    appointmentId: session.metadata?.appointmentId ?? null,
    providerOrderId: null,
    providerCaptureId: null,
    providerCheckoutSessionId: session.id,
    amountCents: session.amount_total ?? null,
    currency: session.currency?.toLowerCase() ?? null,
    internalStatus: mapProviderPaymentStatus(providerStatus),
  };
}

export function shouldFulfillPayment(event: NormalizedPaymentEvent) {
  return event.internalStatus === "paid" &&
    Boolean(event.paymentId || event.appointmentId || event.providerOrderId || event.providerCheckoutSessionId);
}
