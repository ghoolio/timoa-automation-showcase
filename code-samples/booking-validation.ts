/**
 * Cleaned validation helpers based on Timoa's appointment creation route.
 * These functions keep invalid booking data from reaching appointment/payment logic.
 */

import { paymentMethods } from "./payment-status-mapping";

export type AppointmentInput = {
  salonSlug?: unknown;
  serviceId?: unknown;
  serviceIds?: unknown;
  staffMemberId?: unknown;
  paymentMethodChoice?: unknown;
  startsAt?: unknown;
  customerName?: unknown;
  customerEmail?: unknown;
  customerPhone?: unknown;
  notes?: unknown;
};

export type ValidatedAppointmentInput = {
  salonSlug: string;
  serviceId: string;
  serviceIds: string[];
  staffMemberId: string | null;
  paymentMethodChoice: keyof typeof paymentMethods | null;
  startsAt: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  notes: string | null;
};

function asRequiredString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string => typeof item === "string" && Boolean(item.trim()),
  );
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function asPaymentMethodChoice(value: unknown) {
  return value === paymentMethods.stripeCheckout ||
    value === paymentMethods.paypalCheckout ||
    value === paymentMethods.payOnSite
    ? value
    : null;
}

export function validateAppointmentInput(
  input: AppointmentInput,
):
  | { ok: true; value: ValidatedAppointmentInput }
  | { ok: false; reason: string } {
  const salonSlug = asRequiredString(input.salonSlug);
  const serviceId = asRequiredString(input.serviceId);
  const serviceIds = asStringArray(input.serviceIds);
  const startsAtInput = asRequiredString(input.startsAt);
  const customerName = asRequiredString(input.customerName);
  const customerEmail = asRequiredString(input.customerEmail);

  if (
    !salonSlug ||
    !serviceId ||
    !startsAtInput ||
    !customerName ||
    !customerEmail
  ) {
    return { ok: false, reason: "missing_required_fields" };
  }

  if (!isEmail(customerEmail)) {
    return { ok: false, reason: "invalid_email" };
  }

  const startsAt = new Date(startsAtInput);

  if (Number.isNaN(startsAt.getTime())) {
    return { ok: false, reason: "invalid_start_time" };
  }

  return {
    ok: true,
    value: {
      salonSlug,
      serviceId,
      serviceIds,
      staffMemberId: asOptionalString(input.staffMemberId),
      paymentMethodChoice: asPaymentMethodChoice(input.paymentMethodChoice) as
        | keyof typeof paymentMethods
        | null,
      startsAt,
      customerName,
      customerEmail,
      customerPhone: asOptionalString(input.customerPhone),
      notes: asOptionalString(input.notes),
    },
  };
}
