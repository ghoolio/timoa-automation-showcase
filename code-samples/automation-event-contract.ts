/**
 * Cleaned representative excerpt based on lib/analytics/event-registry.ts and track-event.ts.
 * The goal is to define automation-safe event contracts without customer personal data.
 */

export const automationEventFields = [
  "source",
  "actorType",
  "salonId",
  "serviceId",
  "staffMemberId",
  "appointmentId",
  "locale",
  "route",
  "routeGroup",
  "deviceType",
  "viewportCategory",
  "city",
  "postalCodePrefix",
  "serviceCategory",
  "priceCents",
  "durationMinutes",
  "appointmentStartHour",
  "appointmentDayOfWeek",
  "appointmentMonth",
  "leadTimeHours",
  "bookingFunnelStep",
  "resultStatus",
  "failureReasonCode",
  "cancellationReasonCode",
] as const;

export type AutomationEventField = (typeof automationEventFields)[number];

export type AutomationEventType =
  | "booking_started"
  | "booking_submitted"
  | "booking_created"
  | "booking_failed"
  | "payment_method_selected"
  | "payment_checkout_started"
  | "payment_checkout_created"
  | "payment_webhook_received"
  | "payment_webhook_fulfilled"
  | "payment_webhook_duplicate_ignored"
  | "payment_failed"
  | "appointment_rescheduled"
  | "appointment_cancelled"
  | "refund_manual_review_needed"
  | "onboarding_started"
  | "onboarding_step_completed"
  | "onboarding_completed"
  | "insights_page_viewed";

export type AutomationEvent = Partial<
  Record<AutomationEventField, string | number | null>
> & {
  eventType: AutomationEventType;
  eventVersion?: number;
  schemaVersion?: number;
  metadata?: Record<string, string | number | boolean | null>;
};

export type AutomationEventDefinition = {
  eventType: AutomationEventType;
  description: string;
  defaultEnabled: boolean;
  allowedMetadataKeys: readonly string[];
  piiRisk: "low" | "medium" | "high";
  notes?: string;
};

export const automationEventRegistry: Record<
  AutomationEventType,
  AutomationEventDefinition
> = {
  booking_started: {
    eventType: "booking_started",
    description: "A visitor started the booking funnel.",
    defaultEnabled: false,
    allowedMetadataKeys: [],
    piiRisk: "low",
  },
  booking_submitted: {
    eventType: "booking_submitted",
    description: "Server received a booking submission.",
    defaultEnabled: true,
    allowedMetadataKeys: ["serviceCount", "hasStaffPreference"],
    piiRisk: "low",
  },
  booking_created: {
    eventType: "booking_created",
    description: "Appointment was created successfully.",
    defaultEnabled: true,
    allowedMetadataKeys: ["serviceCount", "hasStaffPreference"],
    piiRisk: "low",
    notes:
      "Do not include customer name, email, phone or appointment management links.",
  },
  booking_failed: {
    eventType: "booking_failed",
    description: "Booking request failed before appointment creation.",
    defaultEnabled: true,
    allowedMetadataKeys: ["stage"],
    piiRisk: "low",
  },
  payment_method_selected: {
    eventType: "payment_method_selected",
    description: "Customer selected a payment option.",
    defaultEnabled: true,
    allowedMetadataKeys: ["paymentMethodChoice", "paymentProvider"],
    piiRisk: "low",
  },
  payment_checkout_started: {
    eventType: "payment_checkout_started",
    description: "Online payment checkout was started.",
    defaultEnabled: true,
    allowedMetadataKeys: ["paymentProvider", "currency", "amountCents"],
    piiRisk: "low",
  },
  payment_checkout_created: {
    eventType: "payment_checkout_created",
    description: "Provider checkout object was created.",
    defaultEnabled: true,
    allowedMetadataKeys: ["paymentProvider", "paymentStatus", "currency"],
    piiRisk: "low",
  },
  payment_webhook_received: {
    eventType: "payment_webhook_received",
    description: "Payment provider webhook was received.",
    defaultEnabled: true,
    allowedMetadataKeys: ["paymentProvider", "status"],
    piiRisk: "low",
  },
  payment_webhook_fulfilled: {
    eventType: "payment_webhook_fulfilled",
    description: "Payment webhook was matched and fulfilled.",
    defaultEnabled: true,
    allowedMetadataKeys: ["paymentProvider", "paymentStatus", "currency"],
    piiRisk: "low",
  },
  payment_webhook_duplicate_ignored: {
    eventType: "payment_webhook_duplicate_ignored",
    description: "Duplicate provider event was safely ignored.",
    defaultEnabled: true,
    allowedMetadataKeys: ["paymentProvider", "paymentStatus"],
    piiRisk: "low",
  },
  payment_failed: {
    eventType: "payment_failed",
    description: "Payment failed or was denied.",
    defaultEnabled: true,
    allowedMetadataKeys: ["paymentProvider", "failureReasonCode"],
    piiRisk: "low",
  },
  appointment_rescheduled: {
    eventType: "appointment_rescheduled",
    description: "Appointment was rescheduled successfully.",
    defaultEnabled: true,
    allowedMetadataKeys: [],
    piiRisk: "low",
  },
  appointment_cancelled: {
    eventType: "appointment_cancelled",
    description: "Appointment was cancelled.",
    defaultEnabled: true,
    allowedMetadataKeys: ["cancellationMode"],
    piiRisk: "low",
  },
  refund_manual_review_needed: {
    eventType: "refund_manual_review_needed",
    description: "Cancelled paid appointment requires manual refund review.",
    defaultEnabled: true,
    allowedMetadataKeys: ["paymentProvider", "amountCents"],
    piiRisk: "low",
  },
  onboarding_started: {
    eventType: "onboarding_started",
    description: "Owner opened onboarding.",
    defaultEnabled: true,
    allowedMetadataKeys: ["source"],
    piiRisk: "low",
  },
  onboarding_step_completed: {
    eventType: "onboarding_step_completed",
    description: "Owner completed one onboarding step.",
    defaultEnabled: true,
    allowedMetadataKeys: ["step", "completedCount", "totalCount"],
    piiRisk: "low",
  },
  onboarding_completed: {
    eventType: "onboarding_completed",
    description: "Owner completed required onboarding steps.",
    defaultEnabled: true,
    allowedMetadataKeys: [
      "completedCount",
      "totalCount",
      "paymentMethodsEnabled",
    ],
    piiRisk: "low",
  },
  insights_page_viewed: {
    eventType: "insights_page_viewed",
    description: "Owner viewed aggregated insights.",
    defaultEnabled: true,
    allowedMetadataKeys: ["selectedRange", "hasEnoughData"],
    piiRisk: "low",
  },
};

function safeString(value: unknown, maxLength = 120) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

function safeInteger(value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER) {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= min &&
    value <= max
    ? value
    : undefined;
}

export function sanitizeAutomationEvent(input: AutomationEvent) {
  const definition = automationEventRegistry[input.eventType];

  if (!definition || !definition.defaultEnabled) {
    return null;
  }

  const fields: Record<string, string | number> = {};

  for (const field of automationEventFields) {
    const value = input[field];

    if (
      field === "priceCents" ||
      field === "durationMinutes" ||
      field === "leadTimeHours" ||
      field === "appointmentStartHour" ||
      field === "appointmentDayOfWeek" ||
      field === "appointmentMonth"
    ) {
      const numberValue = safeInteger(value);
      if (numberValue !== undefined) fields[field] = numberValue;
      continue;
    }

    const stringValue = safeString(value);
    if (stringValue !== undefined) fields[field] = stringValue;
  }

  const metadata: Record<string, string | number | boolean | null> = {};

  for (const key of definition.allowedMetadataKeys) {
    const value = input.metadata?.[key];

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      metadata[key] = value;
    }
  }

  return {
    eventType: input.eventType,
    eventVersion: input.eventVersion ?? 1,
    schemaVersion: input.schemaVersion ?? 1,
    ...fields,
    metadata,
  };
}
