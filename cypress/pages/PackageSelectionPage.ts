import type { PlanKey } from "../support/types";

/**
 * `/feature/package` — "Choose Your Package" tier-selection interstitial that sits between the
 * consent chain and checkout. NOT the sortable/paginated results grid described in Scenario 2 of
 * the brief — that grid was never reached by this flow at any tested search-result count (see
 * README.md → "Known Limitations" for why Scenario 2 isn't automated).
 */
class PackageSelectionPage {
  // $420 total / 420 reports / 12-month plan @ $35/mo — default checked
  get oneYearPlan() {
    return cy.get("#oneYear");
  }

  // $105 total / 105 reports / 3-month plan @ $35/mo
  get threeMonthPlan() {
    return cy.get("#threeMonth");
  }

  // $1 / one report, limit one per customer
  get singleReportPlan() {
    return cy.get("#singleReport");
  }

  // $9.95 / 10 reports, limit one per customer
  get fiveReportsPlan() {
    return cy.get("#fiveReports");
  }

  // No id/data-attr; the only <button> inside <main> on this page. Matched by text.
  get continueBtn() {
    return cy.contains("main button", /continue/i);
  }

  // Exhaustive switch (not bracket/template-literal property access) so an invalid PlanKey is a
  // compile-time error instead of a silent runtime `undefined`.
  private radioFor(plan: PlanKey) {
    switch (plan) {
      case "oneYear":
        return this.oneYearPlan;
      case "threeMonth":
        return this.threeMonthPlan;
      case "singleReport":
        return this.singleReportPlan;
      case "fiveReports":
        return this.fiveReportsPlan;
    }
  }

  /** Selects the given tier's radio button. */
  selectPlan(plan: PlanKey) {
    this.radioFor(plan).click();
  }

  /** Confirms the selected tier, advancing to /feature/service-agreement/:planId. */
  continueToServiceAgreement() {
    this.continueBtn.clickOnceAndWaitForUrl("/feature/service-agreement");
  }
}

export const packageSelectionPage = new PackageSelectionPage();
