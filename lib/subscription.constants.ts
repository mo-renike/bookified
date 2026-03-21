// ============================================
// SUBSCRIPTION PLANS
// ============================================

/**
 * Plan slugs must match the plan identifiers configured in Clerk Dashboard.
 * These are used with Clerk's has() method:
 *
 * const { has } = await auth()
 * if (has({ plan: 'standard' })) { ... }
 */
export type SubscriptionPlan = "free" | "standard" | "pro";

export interface PlanLimits {
  name: string;
  maxBooks: number;
  maxSessionsPerMonth: number;
  maxSessionMinutes: number;
  hasSessionHistory: boolean;
}

/**
 * Plan limits define the feature entitlements and usage quotas for each tier.
 * These limits are enforced on the server-side in actions.
 * Clerk's Billing manages the subscription state, while our app enforces these limits.
 */
export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    name: "Free",
    maxBooks: 1,
    maxSessionsPerMonth: 5,
    maxSessionMinutes: 5,
    hasSessionHistory: false,
  },
  standard: {
    name: "Standard",
    maxBooks: 10,
    maxSessionsPerMonth: 100,
    maxSessionMinutes: 15,
    hasSessionHistory: true,
  },
  pro: {
    name: "Pro",
    maxBooks: 100,
    maxSessionsPerMonth: -1, // unlimited
    maxSessionMinutes: 60,
    hasSessionHistory: true,
  },
};

// ============================================
// BILLING PERIOD UTILITIES
// ============================================

export const getCurrentBillingPeriodStart = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
};

export const getCurrentBillingPeriodEnd = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
};
