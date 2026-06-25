/**
 * Cleaned representative excerpt based on app/api/appointments/route.ts.
 * The production route also handles provider checkout creation and emails.
 * This sample focuses on the workflow shape: validate -> load -> check -> create -> respond.
 */

import {
  validateAppointmentInput,
  type AppointmentInput,
} from "./booking-validation";
import { paymentMethods, paymentStatuses } from "./payment-status-mapping";

type Service = {
  id: string;
  salonId: string;
  name: string;
  durationMinutes: number;
  priceCents: number | null;
  isActive: boolean;
};

type Salon = {
  id: string;
  slug: string;
  name: string;
  paymentOnSiteEnabled: boolean;
  stripeEnabled: boolean;
  paypalEnabled: boolean;
  onlinePaymentEnabled: boolean;
};

type AppointmentCreateContext = {
  findSalonBySlug(slug: string): Promise<Salon | null>;
  findActiveServices(input: {
    salonId: string;
    serviceIds: string[];
  }): Promise<Service[]>;
  isSlotAvailable(input: {
    salonId: string;
    startsAt: Date;
    durationMinutes: number;
  }): Promise<boolean>;
  createAppointment(input: {
    salonId: string;
    serviceId: string;
    startsAt: Date;
    endsAt: Date;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    paymentMethod: string;
    paymentStatus: string;
    paymentAmountCents: number | null;
  }): Promise<{ id: string; startsAt: Date; endsAt: Date }>;
  track(event: {
    eventType: string;
    resultStatus: string;
    reason?: string;
  }): Promise<void>;
};

function priceSummaryCents(services: Array<{ priceCents: number | null }>) {
  if (services.some((service) => service.priceCents === null)) {
    return null;
  }

  return services.reduce(
    (total, service) => total + (service.priceCents ?? 0),
    0,
  );
}

function choosePaymentMethod(input: {
  salon: Salon;
  requestedPaymentMethod: string | null;
  totalPriceCents: number | null;
}) {
  const payableOnline =
    input.salon.onlinePaymentEnabled && (input.totalPriceCents ?? 0) > 0;
  const available = [
    ...(input.salon.paymentOnSiteEnabled ? [paymentMethods.payOnSite] : []),
    ...(payableOnline && input.salon.stripeEnabled
      ? [paymentMethods.stripeCheckout]
      : []),
    ...(payableOnline && input.salon.paypalEnabled
      ? [paymentMethods.paypalCheckout]
      : []),
  ];

  return input.requestedPaymentMethod &&
    available.includes(input.requestedPaymentMethod as never)
    ? input.requestedPaymentMethod
    : (available[0] ?? paymentMethods.payOnSite);
}

function paymentStatusFor(method: string, totalPriceCents: number | null) {
  if (
    method === paymentMethods.stripeCheckout ||
    method === paymentMethods.paypalCheckout
  ) {
    return paymentStatuses.pending;
  }

  return totalPriceCents === 0
    ? paymentStatuses.notRequired
    : paymentStatuses.payOnSite;
}

export async function createAppointmentAction(
  input: AppointmentInput,
  context: AppointmentCreateContext,
) {
  const validated = validateAppointmentInput(input);

  if (!validated.ok) {
    await context.track({
      eventType: "booking_failed",
      resultStatus: "failed",
      reason: validated.reason,
    });
    return { ok: false, status: 400, error: validated.reason };
  }

  const salon = await context.findSalonBySlug(validated.value.salonSlug);

  if (!salon) {
    await context.track({
      eventType: "booking_failed",
      resultStatus: "failed",
      reason: "salon_not_found",
    });
    return { ok: false, status: 404, error: "salon_not_found" };
  }

  const selectedServiceIds = Array.from(
    new Set([validated.value.serviceId, ...validated.value.serviceIds]),
  );
  const services = await context.findActiveServices({
    salonId: salon.id,
    serviceIds: selectedServiceIds,
  });

  if (services.length !== selectedServiceIds.length) {
    await context.track({
      eventType: "booking_failed",
      resultStatus: "failed",
      reason: "service_not_found",
    });
    return { ok: false, status: 404, error: "service_not_found" };
  }

  const totalDurationMinutes = services.reduce(
    (total, service) => total + service.durationMinutes,
    0,
  );
  const totalPriceCents = priceSummaryCents(services);
  const slotAvailable = await context.isSlotAvailable({
    salonId: salon.id,
    startsAt: validated.value.startsAt,
    durationMinutes: totalDurationMinutes,
  });

  if (!slotAvailable) {
    await context.track({
      eventType: "booking_failed",
      resultStatus: "failed",
      reason: "slot_unavailable",
    });
    return { ok: false, status: 409, error: "slot_unavailable" };
  }

  const paymentMethod = choosePaymentMethod({
    salon,
    requestedPaymentMethod: validated.value.paymentMethodChoice,
    totalPriceCents,
  });

  const appointment = await context.createAppointment({
    salonId: salon.id,
    serviceId: validated.value.serviceId,
    startsAt: validated.value.startsAt,
    endsAt: new Date(
      validated.value.startsAt.getTime() + totalDurationMinutes * 60_000,
    ),
    customerName: validated.value.customerName,
    customerEmail: validated.value.customerEmail,
    customerPhone: validated.value.customerPhone,
    paymentMethod,
    paymentStatus: paymentStatusFor(paymentMethod, totalPriceCents),
    paymentAmountCents: totalPriceCents,
  });

  await context.track({
    eventType: "booking_created",
    resultStatus: "success",
  });

  return {
    ok: true,
    status: 201,
    appointment,
    paymentRequired:
      paymentMethod === paymentMethods.stripeCheckout ||
      paymentMethod === paymentMethods.paypalCheckout,
  };
}
