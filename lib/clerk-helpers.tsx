/**
 * Clerk Integration Helpers
 *
 * This file provides examples and utilities for using Clerk's native
 * billing features with the has() method and <Show> component.
 *
 * Documentation: https://clerk.com/docs/nextjs/guides/billing/for-b2c
 */

import { ReactNode } from "react";
import { Show } from "@clerk/nextjs";

/**
 * Example: Show content only to users with the Standard plan
 *
 * Usage:
 * ```tsx
 * <StandardPlanFeature>
 *   <p>This feature is only available on the Standard plan</p>
 * </StandardPlanFeature>
 * ```
 */
export function StandardPlanFeature({ children }: { children: ReactNode }) {
  return (
    <Show
      when={{ plan: "standard" }}
      fallback={
        <div className="p-4 border border-border rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground">
            This feature requires the Standard plan or higher.
            <a
              href="/subscriptions"
              className="ml-1 font-semibold text-primary hover:underline"
            >
              Upgrade now
            </a>
          </p>
        </div>
      }
    >
      {children}
    </Show>
  );
}

/**
 * Example: Show content only to users with the Pro plan
 *
 * Usage:
 * ```tsx
 * <ProPlanFeature>
 *   <p>This feature is exclusive to Pro subscribers</p>
 * </ProPlanFeature>
 * ```
 */
export function ProPlanFeature({ children }: { children: ReactNode }) {
  return (
    <Show
      when={{ plan: "pro" }}
      fallback={
        <div className="p-4 border border-border rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground">
            This feature is exclusive to Pro subscribers.
            <a
              href="/subscriptions"
              className="ml-1 font-semibold text-primary hover:underline"
            >
              Upgrade to Pro
            </a>
          </p>
        </div>
      }
    >
      {children}
    </Show>
  );
}

/**
 * Example: Show different content based on plan level
 *
 * Usage:
 * ```tsx
 * <PlanBasedContent
 *   freeContent={<p>Basic features</p>}
 *   standardContent={<p>Advanced features</p>}
 *   proContent={<p>Premium features</p>}
 * />
 * ```
 */
export function PlanBasedContent({
  freeContent,
  standardContent,
  proContent,
}: {
  freeContent: ReactNode;
  standardContent: ReactNode;
  proContent: ReactNode;
}) {
  return (
    <>
      {/* Show for Free plan (default) */}
      <Show
        when={{ plan: "pro" }}
        fallback={
          <Show when={{ plan: "standard" }} fallback={freeContent}>
            {standardContent}
          </Show>
        }
      >
        {proContent}
      </Show>
    </>
  );
}

/**
 * NOTES FOR SERVER-SIDE AUTHORIZATION
 *
 * For server-side checks in API routes or server actions, use:
 *
 * ```tsx
 * import { auth } from '@clerk/nextjs/server'
 *
 * export async function myServerAction() {
 *   const { has } = await auth()
 *
 *   if (!has({ plan: 'standard' })) {
 *     throw new Error('This action requires Standard plan')
 *   }
 *
 *   // Proceed with premium feature
 * }
 * ```
 *
 * Plan slugs configured in Clerk Dashboard:
 * - 'free' (default for no active plan)
 * - 'standard'
 * - 'pro'
 *
 * These are checked with: has({ plan: 'standard' }) or has({ plan: 'pro' })
 */
