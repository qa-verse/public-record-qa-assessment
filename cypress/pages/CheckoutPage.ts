/**
 * `/feature/checkout/:planId` — billing/payment form. All selectors captured live against the
 * real DOM.
 *
 * SCOPE CONSTRAINT (Assessment Brief p.1): tests must reach and validate this page but must NEVER
 * submit a real purchase. confirmPaymentBtn is exposed here only so its presence/state can be
 * asserted — no spec may ever call .click() on it.
 */
class CheckoutPage {
  get form() {
    return cy.get("#checkoutForm");
  }

  get cardholderFirstName() {
    return cy.get("#firstName");
  }

  get cardholderLastName() {
    return cy.get("#lastName");
  }

  get cardNumber() {
    return cy.get("#cc");
  }

  get cvv() {
    return cy.get("#cvv");
  }

  get expirationMonth() {
    return cy.get("#month");
  }

  get expirationYear() {
    return cy.get("#year");
  }

  // Hidden on initial render (wrapping element carries a conditional `!hidden` class), but this is
  // a real, working progressive-disclosure field, not dead UI: it becomes visible once the card
  // number/CVV/expiration fields look filled in (React state reacting to those fields, confirmed
  // live with no click involved). No standalone zip/postal input exists anywhere else on this page.
  get billingAddressSearch() {
    return cy.get("#address-search-input");
  }

  get email() {
    return cy.get("#email");
  }

  get billingTermsCheckbox() {
    return cy.get("#terms");
  }

  // No id/data-attr on the order-summary container; matched by its "Order Summary" heading text,
  // then its parent (the block holding price/plan/due-today/next-payment lines).
  get orderSummaryPanel() {
    return cy.contains("div", "Order Summary").parent();
  }

  /**
   * Asserts the order-summary panel contains every line in `expectedLines` and none of
   * `absentLines` — used to prove a tier switch produced a materially different summary, not just
   * a substituted number (see `cypress/fixtures/plans.json`).
   */
  assertOrderSummaryShows(expectedLines: string[], absentLines: string[] = []) {
    expectedLines.forEach((line) => this.orderSummaryPanel.should("contain.text", line));
    absentLines.forEach((line) => this.orderSummaryPanel.should("not.contain.text", line));
  }

  // Intentionally no confirmPayment()/submit() action method here — only a getter. The assessment's
  // scope constraint (Assessment Brief p.1) prohibits ever completing a real purchase; not giving
  // this element a click-triggering method makes that boundary a property of the API surface, not
  // just a convention every spec has to remember to honor.
  get confirmPaymentBtn() {
    return cy.get(".checkout-form_submit-btn");
  }
}

export const checkoutPage = new CheckoutPage();
