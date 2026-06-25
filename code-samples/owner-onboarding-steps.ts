/**
 * Cleaned excerpt based on lib/onboarding/setup.ts.
 * Shows how Timoa translates salon setup into measurable onboarding progress.
 */

type TranslationKey = string;

export const onboardingSteps = [
  "profile",
  "location",
  "services",
  "staff",
  "availability",
  "media",
  "payments",
  "policies",
  "bookingLink",
] as const;

export type OnboardingStep = (typeof onboardingSteps)[number];

export type OnboardingChecklist = Record<OnboardingStep, boolean>;

export type OnboardingProgress = {
  checklist: OnboardingChecklist;
  requiredSteps: OnboardingStep[];
  completedRequiredCount: number;
  totalRequiredCount: number;
  completedCount: number;
  totalCount: number;
  percent: number;
  readyForBookings: boolean;
  paymentMethodsEnabled: number;
  hasPublicSlug: boolean;
};

export const onboardingStepLabelKeys = {
  profile: "dashboard.onboarding.step.profile",
  location: "dashboard.onboarding.step.location",
  services: "dashboard.onboarding.step.services",
  staff: "dashboard.onboarding.step.staff",
  availability: "dashboard.onboarding.step.availability",
  media: "dashboard.onboarding.step.media",
  payments: "dashboard.onboarding.step.payments",
  policies: "dashboard.onboarding.step.policies",
  bookingLink: "dashboard.onboarding.step.bookingLink",
} as const satisfies Record<OnboardingStep, TranslationKey>;

export const dashboardChecklistSteps = [
  "profile",
  "services",
  "staff",
  "availability",
  "payments",
  "bookingLink",
] as const satisfies readonly OnboardingStep[];

export const requiredOnboardingSteps = [
  "profile",
  "services",
  "staff",
  "availability",
  "payments",
  "bookingLink",
] as const satisfies readonly OnboardingStep[];

type SetupSalon = {
  name: string | null;
  slug: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  paymentOnSiteEnabled: boolean;
  stripeEnabled: boolean;
  paypalEnabled: boolean;
  cancellationPolicyEnabled: boolean;
  cancellationPolicyText: string | null;
  cancellationNoticeHours: number | null;
  services: Array<{ isActive: boolean }>;
  staffMembers: Array<{ isActive: boolean }>;
  openingHours: Array<{
    isClosed: boolean;
    openMinutes: number | null;
    closeMinutes: number | null;
  }>;
};

function present(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function countCompleted(
  checklist: OnboardingChecklist,
  steps: readonly OnboardingStep[],
) {
  return steps.filter((step) => checklist[step]).length;
}

export function getOnboardingProgress(input: {
  salon: SetupSalon;
  ownerName?: string | null;
}): OnboardingProgress {
  const hasPublicSlug = present(input.salon.slug);
  const hasActiveService = input.salon.services.some(
    (service) => service.isActive,
  );
  const hasStaffOrOwnerFallback =
    input.salon.staffMembers.some((staff) => staff.isActive) ||
    present(input.ownerName);
  const hasOpeningHours = input.salon.openingHours.some(
    (hour) =>
      !hour.isClosed && hour.openMinutes !== null && hour.closeMinutes !== null,
  );
  const paymentMethodsEnabled = [
    input.salon.paymentOnSiteEnabled,
    input.salon.stripeEnabled,
    input.salon.paypalEnabled,
  ].filter(Boolean).length;
  const checklist: OnboardingChecklist = {
    profile: present(input.salon.name) && hasPublicSlug,
    location: present(input.salon.address) || present(input.salon.city),
    services: hasActiveService,
    staff: hasStaffOrOwnerFallback,
    availability: hasOpeningHours,
    media: present(input.salon.logoUrl) || present(input.salon.coverImageUrl),
    payments: paymentMethodsEnabled > 0,
    policies:
      input.salon.cancellationPolicyEnabled ||
      Boolean(input.salon.cancellationNoticeHours) ||
      present(input.salon.cancellationPolicyText),
    bookingLink: hasPublicSlug && hasActiveService,
  };
  const completedRequiredCount = countCompleted(
    checklist,
    requiredOnboardingSteps,
  );
  const completedCount = countCompleted(checklist, onboardingSteps);
  const totalRequiredCount = requiredOnboardingSteps.length;

  return {
    checklist,
    requiredSteps: [...requiredOnboardingSteps],
    completedRequiredCount,
    totalRequiredCount,
    completedCount,
    totalCount: onboardingSteps.length,
    percent: Math.round((completedRequiredCount / totalRequiredCount) * 100),
    readyForBookings: completedRequiredCount === totalRequiredCount,
    paymentMethodsEnabled,
    hasPublicSlug,
  };
}

export function setupChecklistJson(progress: OnboardingProgress) {
  return {
    ...progress.checklist,
    completedRequiredCount: progress.completedRequiredCount,
    totalRequiredCount: progress.totalRequiredCount,
    readyForBookings: progress.readyForBookings,
    updatedAt: new Date().toISOString(),
  };
}
