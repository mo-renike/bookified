"use client";

import { PricingTable } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SubscriptionsPage() {
  return (
    <div className="container min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold font-serif tracking-tight text-foreground sm:text-5xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the perfect plan for your reading and learning needs
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Table Section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Suspense
          fallback={<div className="text-center py-12">Loading pricing...</div>}
        >
          <PricingTable />
        </Suspense>
      </div>

      {/* FAQ Section */}
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold font-serif tracking-tight text-foreground mb-12 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Can I switch plans anytime?
            </h3>
            <p className="text-muted-foreground">
              Yes! You can upgrade or downgrade your plan at any time. Changes
              will take effect immediately.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              What happens to my books when I downgrade?
            </h3>
            <p className="text-muted-foreground">
              Your existing books are safe. If you exceed the limit for your new
              plan, you&apos;ll be able to access existing books but won&apos;t
              be able to create new ones until you&apos;re within the limit.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              How is session time tracked?
            </h3>
            <p className="text-muted-foreground">
              Session time is tracked per calendar month (1st to last day of the
              month). Your session counter resets on the 1st of each month.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Is there a free trial?
            </h3>
            <p className="text-muted-foreground">
              Yes! The Free tier is always available. You can start with the
              Free plan and upgrade whenever you&apos;re ready.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
