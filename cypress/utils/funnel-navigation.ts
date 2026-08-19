import { homePage } from "../pages/HomePage";
import { ageVerificationPage } from "../pages/AgeVerificationPage";
import { noticePage } from "../pages/NoticePage";
import { packageSelectionPage } from "../pages/PackageSelectionPage";
import { serviceAgreementPage } from "../pages/ServiceAgreementPage";
import type { PlanKey } from "../support/types";

/**
 * Thin composition of Page Object actions that walks the full funnel from a fresh session to the
 * checkout/payment page for the given tier. Exists for specs whose focus is checkout-page behavior
 * (e.g. `checkout-validation.cy.ts`) — reusing it there is setup, not a shortcut.
 *
 * `search-funnel.cy.ts` deliberately does NOT use this: its tests are verifying the search +
 * consent-chain steps themselves, so it calls the same underlying Page Object methods
 * (`homePage.searchByName`, `ageVerificationPage.accept`, ...) directly and individually instead
 * of through this aggregate — hiding those steps behind one opaque call would hide the behavior
 * under test. This function exists to avoid *duplicating* those steps for tests that don't care
 * about them, not to hide them from tests that do.
 *
 * Direct URL navigation to /feature/package or /feature/checkout/:planId was deliberately NOT used
 * even though it appears to work in an already-warm browser session: this session's exploration
 * never established whether those routes render correctly on a genuinely cookie-free first visit,
 * and Cypress resets cookies before every test by default (testIsolation). Walking the real funnel
 * every time is slower but doesn't rely on that unverified assumption.
 */
export function navigateToCheckout(plan: PlanKey = "oneYear", searchName = "James Smith") {
  cy.clearCookies();
  cy.clearLocalStorage();
  homePage.visit();
  cy.waitForWafChallenge();

  homePage.searchByName(searchName);
  homePage.acceptResultsCountDisclaimer();
  ageVerificationPage.accept();
  noticePage.accept();
  packageSelectionPage.selectPlan(plan);
  packageSelectionPage.continueToServiceAgreement();
  serviceAgreementPage.accept();
}
