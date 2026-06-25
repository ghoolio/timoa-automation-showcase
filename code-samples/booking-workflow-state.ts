/**
 * Cleaned representative excerpt from the Timoa booking flow.
 * The production UI lives in React, but the core flow is a state machine:
 * service -> staff -> time -> payment -> customer details -> confirmation.
 */

export type BookingStep =
  | "select_service"
  | "select_staff"
  | "select_time"
  | "select_payment"
  | "enter_details"
  | "confirm_booking"
  | "booking_created";

export type PaymentMethodChoice =
  | "pay_on_site"
  | "stripe_checkout"
  | "paypal_checkout";

export type BookingService = {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number | null;
  isActive: boolean;
};

export type BookingState = {
  selectedServiceIds: string[];
  selectedStaffMemberId?: string | null;
  selectedSlot?: { start: string; end: string; label: string } | null;
  selectedPaymentMethod: PaymentMethodChoice;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
};

export function getNextBookingStep(currentStep: BookingStep): BookingStep {
  switch (currentStep) {
    case "select_service":
      return "select_staff";
    case "select_staff":
      return "select_time";
    case "select_time":
      return "select_payment";
    case "select_payment":
      return "enter_details";
    case "enter_details":
      return "confirm_booking";
    case "confirm_booking":
      return "booking_created";
    case "booking_created":
      return "booking_created";
  }
}

export function totalDurationMinutes(services: BookingService[]) {
  return services.reduce((total, service) => total + service.durationMinutes, 0);
}

export function totalPriceCents(services: BookingService[]) {
  if (services.some((service) => service.priceCents === null)) {
    return null;
  }

  return services.reduce((total, service) => total + (service.priceCents ?? 0), 0);
}

export function availablePaymentMethods(input: {
  paymentOnSiteEnabled: boolean;
  stripeEnabled: boolean;
  paypalEnabled: boolean;
  onlinePaymentEnabled: boolean;
  totalPriceCents: number | null;
}): PaymentMethodChoice[] {
  const payableOnline = input.onlinePaymentEnabled && (input.totalPriceCents ?? 0) > 0;

  return [
    ...(input.paymentOnSiteEnabled ? ["pay_on_site" as const] : []),
    ...(payableOnline && input.stripeEnabled ? ["stripe_checkout" as const] : []),
    ...(payableOnline && input.paypalEnabled ? ["paypal_checkout" as const] : []),
  ];
}

export function isBookingReady(state: BookingState) {
  return Boolean(
    state.selectedServiceIds.length > 0 &&
      state.selectedSlot &&
      state.customerName.trim() &&
      state.customerEmail.trim(),
  );
}
