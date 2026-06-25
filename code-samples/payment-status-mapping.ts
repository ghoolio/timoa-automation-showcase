/**
 * Cleaned excerpt based on lib/payments/payment-status.ts and payment return handling.
 * External providers have their own status language; Timoa maps those into internal process states.
 */

export const paymentStatuses = {
  notRequired: "not_required",
  payOnSite: "pay_on_site",
  pending: "pending",
  paid: "paid",
  failed: "failed",
  cancelled: "cancelled",
  expired: "expired",
} as const;

export const paymentMethods = {
  payOnSite: "pay_on_site",
  stripeCheckout: "stripe_checkout",
  paypalCheckout: "paypal_checkout",
} as const;

export const paymentProviders = {
  stripe: "stripe",
  paypal: "paypal",
} as const;

export type InternalPaymentStatus =
  (typeof paymentStatuses)[keyof typeof paymentStatuses];

export type ProviderPaymentStatus =
  | "created"
  | "approved"
  | "completed"
  | "captured"
  | "succeeded"
  | "failed"
  | "denied"
  | "cancelled"
  | "expired"
  | "pending";

export function mapProviderPaymentStatus(
  status: ProviderPaymentStatus,
): InternalPaymentStatus {
  switch (status) {
    case "completed":
    case "captured":
    case "succeeded":
      return paymentStatuses.paid;
    case "failed":
    case "denied":
      return paymentStatuses.failed;
    case "cancelled":
      return paymentStatuses.cancelled;
    case "expired":
      return paymentStatuses.expired;
    case "created":
    case "approved":
    case "pending":
      return paymentStatuses.pending;
  }
}

export function deriveReturnState(input: {
  paymentStatus: InternalPaymentStatus;
  appointmentPaymentStatus: InternalPaymentStatus;
}) {
  const paid =
    input.paymentStatus === paymentStatuses.paid ||
    input.appointmentPaymentStatus === paymentStatuses.paid;
  const failed =
    input.paymentStatus === paymentStatuses.failed ||
    input.appointmentPaymentStatus === paymentStatuses.failed;
  const expired =
    input.paymentStatus === paymentStatuses.expired ||
    input.appointmentPaymentStatus === paymentStatuses.expired;

  return {
    paid,
    failed,
    expired,
    pending: !paid && !failed && !expired,
  };
}
