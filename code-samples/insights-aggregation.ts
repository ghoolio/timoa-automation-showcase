/**
 * Cleaned representative excerpt based on lib/insights/salon-insights.ts.
 * Timoa insights are aggregated and avoid exposing customer personal data.
 */

import { paymentMethods, paymentProviders, paymentStatuses } from "./payment-status-mapping";

export const insightRanges = ["7d", "30d", "90d", "all"] as const;
export type InsightRange = (typeof insightRanges)[number];

type AppointmentStatus = "SCHEDULED" | "CANCELLED";

export type AppointmentInsightRow = {
  startsAt: Date;
  status: AppointmentStatus;
  paymentStatus: string;
  paymentMethod: string | null;
  paidAt: Date | null;
  service: {
    id: string;
    name: string;
    durationMinutes: number;
    priceCents: number | null;
  };
};

export type PaymentInsightRow = {
  provider: string;
  amountCents: number;
  currency: string;
  paidAt: Date | null;
};

export function normalizeInsightRange(value: unknown): InsightRange {
  return typeof value === "string" && insightRanges.includes(value as InsightRange)
    ? (value as InsightRange)
    : "30d";
}

export function appointmentPaymentMethod(
  appointment: AppointmentInsightRow,
): "pay_at_salon" | "stripe_checkout" | "paypal_checkout" | "unknown" {
  if (appointment.paymentMethod === paymentMethods.payOnSite || appointment.paymentStatus === paymentStatuses.payOnSite) {
    return "pay_at_salon";
  }

  if (appointment.paymentMethod === paymentMethods.stripeCheckout) {
    return "stripe_checkout";
  }

  if (appointment.paymentMethod === paymentMethods.paypalCheckout) {
    return "paypal_checkout";
  }

  return "unknown";
}

function share(count: number, total: number) {
  return total > 0 ? Math.round((count / total) * 100) : 0;
}

export function aggregateSalonInsights(input: {
  appointments: AppointmentInsightRow[];
  onlinePaidPayments: PaymentInsightRow[];
}) {
  const totalAppointments = input.appointments.length;
  const confirmedAppointments = input.appointments.filter((item) => item.status === "SCHEDULED").length;
  const cancelledAppointments = input.appointments.filter((item) => item.status === "CANCELLED").length;
  const knownValueAppointments = input.appointments.filter((item) => item.service.priceCents !== null);
  const expectedOnSiteRevenueCents = input.appointments
    .filter((item) => appointmentPaymentMethod(item) === "pay_at_salon")
    .reduce((total, item) => total + (item.service.priceCents ?? 0), 0);
  const onlinePaidRevenueCents = input.onlinePaidPayments
    .filter((payment) => payment.provider === paymentProviders.stripe || payment.provider === paymentProviders.paypal)
    .reduce((total, payment) => total + payment.amountCents, 0);

  const serviceCounts = new Map<string, {
    serviceId: string;
    serviceName: string;
    bookingCount: number;
    cancelledCount: number;
    valueCents: number;
    totalDurationMinutes: number;
  }>();

  for (const appointment of input.appointments) {
    const current = serviceCounts.get(appointment.service.id) ?? {
      serviceId: appointment.service.id,
      serviceName: appointment.service.name,
      bookingCount: 0,
      cancelledCount: 0,
      valueCents: 0,
      totalDurationMinutes: 0,
    };

    current.bookingCount += 1;
    current.cancelledCount += appointment.status === "CANCELLED" ? 1 : 0;
    current.valueCents += appointment.service.priceCents ?? 0;
    current.totalDurationMinutes += appointment.service.durationMinutes;
    serviceCounts.set(appointment.service.id, current);
  }

  const paymentMethodCounts = new Map<string, number>();

  for (const appointment of input.appointments) {
    const method = appointmentPaymentMethod(appointment);
    paymentMethodCounts.set(method, (paymentMethodCounts.get(method) ?? 0) + 1);
  }

  return {
    bookingOverview: {
      totalAppointments,
      confirmedAppointments,
      cancelledAppointments,
      paidAppointments: input.appointments.filter((item) => item.paymentStatus === paymentStatuses.paid).length,
      cancellationRate: share(cancelledAppointments, totalAppointments),
    },
    revenueOverview: {
      onlinePaidRevenueCents,
      expectedOnSiteRevenueCents,
      averageBookingValueCents: knownValueAppointments.length > 0
        ? Math.round(knownValueAppointments.reduce((total, item) => total + (item.service.priceCents ?? 0), 0) / knownValueAppointments.length)
        : null,
      knownValueAppointments: knownValueAppointments.length,
      currency: "eur",
    },
    topServices: [...serviceCounts.values()]
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .map((item) => ({
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        bookingCount: item.bookingCount,
        cancelledCount: item.cancelledCount,
        valueCents: item.valueCents,
        averageDurationMinutes: Math.round(item.totalDurationMinutes / item.bookingCount),
      })),
    paymentMethodMix: [...paymentMethodCounts.entries()].map(([method, count]) => ({
      method,
      count,
      share: share(count, totalAppointments),
    })),
  };
}
