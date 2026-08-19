/** The four tiers offered on `/feature/package` — see PackageSelectionPage. */
export type PlanKey = "oneYear" | "threeMonth" | "singleReport" | "fiveReports";

/** Synthetic-only billing data shape for `cypress/fixtures/checkout-data.json`. Never real payment info. */
export interface BillingData {
  firstName: string;
  lastName: string;
  cardNumber: string;
  email: string;
}

/** Expected order-summary content for one plan, keyed by `PlanKey` in `cypress/fixtures/plans.json`. */
export interface PlanSummaryData {
  /** Substrings that must appear in the checkout page's order-summary panel for this plan. */
  expectedLines: string[];
  /** Substrings that belong to *other* plans' summaries and must NOT leak into this one. */
  absentLines: string[];
}
