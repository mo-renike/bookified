"use server";

import { auth } from "@clerk/nextjs/server";
import {
  SubscriptionPlan,
  PLAN_LIMITS,
  getCurrentBillingPeriodStart,
} from "./subscription.constants";
import { connectToDatabase } from "@/database/mongoose";
import VoiceSessionModel from "@/database/models/voiceSession.model";
import BookModel from "@/database/models/book.model";
import type { ClientSession } from "mongoose";

const getCurrentBillingPeriodRange = () => {
  const periodStart = getCurrentBillingPeriodStart();
  const nextPeriodStart = new Date(
    periodStart.getFullYear(),
    periodStart.getMonth() + 1,
    1,
    0,
    0,
    0,
  );

  return { periodStart, nextPeriodStart };
};

/**
 * Get the current user's subscription plan using Clerk's has() method.
 * Returns 'free' if user has no active subscription, otherwise uses native Clerk plan checking.
 */
export const getUserPlan = async (): Promise<SubscriptionPlan> => {
  try {
    const { has } = await auth();

    if (has({ plan: "pro" })) {
      return "pro";
    }

    if (has({ plan: "standard" })) {
      return "standard";
    }

    return "free";
  } catch (error) {
    console.error("Error getting user plan:", error);
    return "free";
  }
};

/**
 * Get the current user's plan limits.
 */
export const getUserPlanLimits = async () => {
  const plan = await getUserPlan();
  return PLAN_LIMITS[plan];
};

type CanCreateBookOptions = {
  userId?: string;
  plan?: SubscriptionPlan;
  session?: ClientSession;
};

/**
 * Check if user can create a new book based on their subscription plan.
 * Returns { allowed: boolean, reason?: string }
 */
export const canCreateBook = async (
  options: CanCreateBookOptions = {},
): Promise<{
  allowed: boolean;
  reason?: string;
}> => {
  try {
    const { userId: authUserId } = await auth();
    const userId = options.userId ?? authUserId;

    if (!userId) {
      return { allowed: false, reason: "Unauthorized" };
    }

    const plan = options.plan ?? (await getUserPlan());
    const limits = PLAN_LIMITS[plan];

    await connectToDatabase();

    // Count existing books for this user
    const bookCount = await BookModel.countDocuments(
      { clerkId: userId },
      options.session ? { session: options.session } : undefined,
    );

    if (bookCount >= limits.maxBooks) {
      return {
        allowed: false,
        reason: `You've reached the maximum of ${limits.maxBooks} books for the ${plan} plan. Upgrade to add more books.`,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Error checking book creation eligibility:", error);
    return { allowed: false, reason: "Failed to verify subscription limits" };
  }
};

/**
 * Check if user can start a new voice session based on their subscription plan.
 * Returns { allowed: boolean, reason?: string, maxDurationMinutes?: number }
 */
export const canStartVoiceSession = async (): Promise<{
  allowed: boolean;
  reason?: string;
  maxDurationMinutes?: number;
}> => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { allowed: false, reason: "Unauthorized" };
    }

    const plan = await getUserPlan();
    const limits = PLAN_LIMITS[plan];

    await connectToDatabase();

    const { periodStart, nextPeriodStart } = getCurrentBillingPeriodRange();

    // Count sessions in current billing period
    const sessionCount = await VoiceSessionModel.countDocuments({
      clerkId: userId,
      billingPeriodStart: {
        $gte: periodStart,
        $lt: nextPeriodStart,
      },
    });

    // Check session limit (unlimited = -1)
    if (
      limits.maxSessionsPerMonth !== -1 &&
      sessionCount >= limits.maxSessionsPerMonth
    ) {
      return {
        allowed: false,
        reason: `You've reached the maximum of ${limits.maxSessionsPerMonth} sessions for this month on the ${plan} plan. Upgrade to continue.`,
      };
    }

    return {
      allowed: true,
      maxDurationMinutes: limits.maxSessionMinutes,
    };
  } catch (error) {
    console.error("Error checking voice session eligibility:", error);
    return { allowed: false, reason: "Failed to verify subscription limits" };
  }
};

/**
 * Get current session count and limit for the billing period.
 */
export const getSessionUsage = async (): Promise<{
  current: number;
  limit: number;
}> => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { current: 0, limit: 0 };
    }

    const plan = await getUserPlan();
    const limits = PLAN_LIMITS[plan];

    await connectToDatabase();

    const { periodStart, nextPeriodStart } = getCurrentBillingPeriodRange();
    const current = await VoiceSessionModel.countDocuments({
      clerkId: userId,
      billingPeriodStart: {
        $gte: periodStart,
        $lt: nextPeriodStart,
      },
    });

    return {
      current,
      limit:
        limits.maxSessionsPerMonth === -1 ? 999 : limits.maxSessionsPerMonth,
    };
  } catch (error) {
    console.error("Error getting session usage:", error);
    return { current: 0, limit: 0 };
  }
};

/**
 * Get current book count and limit.
 */
export const getBookUsage = async (): Promise<{
  current: number;
  limit: number;
}> => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { current: 0, limit: 0 };
    }

    const plan = await getUserPlan();
    const limits = PLAN_LIMITS[plan];

    await connectToDatabase();

    const current = await BookModel.countDocuments({ clerkId: userId });

    return {
      current,
      limit: limits.maxBooks,
    };
  } catch (error) {
    console.error("Error getting book usage:", error);
    return { current: 0, limit: 0 };
  }
};
