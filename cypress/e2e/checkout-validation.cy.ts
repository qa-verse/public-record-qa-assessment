import { checkoutPage } from "../pages/CheckoutPage";
import { navigateToCheckout } from "../utils/funnel-navigation";
import type { BillingData, PlanSummaryData } from "../support/types";

// Submit-time field validation (what happens when Confirm Payment is actually clicked) is
// deliberately not exercised anywhere in this file — see README.md → "Checkout Safety Boundary".
describe("Checkout Gate Field Validation (No Purchase)", () => {
  let plans: Record<"oneYear" | "singleReport", PlanSummaryData>;
  let billing: BillingData;

  before(() => {
    cy.fixture("plans.json").then((data) => {
      plans = data;
    });
    cy.fixture("checkout-data.json").then((data) => {
      billing = data;
    });
  });

  it("advances from the home search through the full funnel to the billing/payment page", () => {
    navigateToCheckout();

    cy.url().should("include", "/feature/checkout");
    checkoutPage.form.should("be.visible");
    checkoutPage.cardholderFirstName.should("be.visible");
    checkoutPage.cardholderLastName.should("be.visible");
    checkoutPage.cardNumber.should("be.visible");
    checkoutPage.cvv.should("be.visible");
    checkoutPage.expirationMonth.should("be.visible");
    checkoutPage.expirationYear.should("be.visible");
    checkoutPage.email.should("be.visible");
    checkoutPage.billingTermsCheckbox.should("exist").and("not.be.checked");
    checkoutPage.assertOrderSummaryShows(plans.oneYear.expectedLines, plans.oneYear.absentLines);

    // Presence only — never interacted with beyond this. See CheckoutPage.confirmPaymentBtn.
    checkoutPage.confirmPaymentBtn.should("be.visible");
  });

  it("updates the order summary panel when a different (single-report) tier is selected", () => {
    // The default tier's summary and the single-report tier's summary are materially different
    // layouts — the latter drops every recurring-payment line entirely, not just a substituted
    // number. Expected content lives in cypress/fixtures/plans.json.
    navigateToCheckout("singleReport");

    cy.url().should("include", "/feature/checkout");
    checkoutPage.assertOrderSummaryShows(plans.singleReport.expectedLines, plans.singleReport.absentLines);
  });

  it("reveals the billing-address field once card details are entered", () => {
    // The field is hidden until card number/CVV/expiration look filled in, then appears — a
    // progressive-disclosure pattern, not a broken/unreachable field.
    navigateToCheckout();

    checkoutPage.billingAddressSearch.should("not.be.visible");

    checkoutPage.cardNumber.type(billing.cardNumber);
    checkoutPage.cvv.type("123");

    checkoutPage.billingAddressSearch.should("be.visible");
  });

  it("does not show inline validation when the email field is left malformed and blurred", () => {
    // Scoped to blur-time behavior specifically: the email field is type="text", so no native
    // browser validation applies, and this suite does not trigger submit-time validation (see the
    // file header) — this test only proves blur-time validation doesn't exist, not that no
    // validation exists at all.
    navigateToCheckout();

    checkoutPage.email.type("not-an-email");
    checkoutPage.cardholderFirstName.click(); // blur email by moving focus elsewhere

    checkoutPage.email.should("not.have.attr", "aria-invalid");
    cy.contains(/invalid email/i).should("not.exist");
  });

  it("does not preserve any entered billing data across a browser reload", () => {
    // `billing` is loaded from cypress/fixtures/checkout-data.json — synthetic data only (the
    // industry-standard test Visa number), never anything resembling a real card.
    navigateToCheckout();

    checkoutPage.cardholderFirstName.type(billing.firstName);
    checkoutPage.cardNumber.type(billing.cardNumber);
    checkoutPage.email.type(billing.email);

    cy.reload();

    checkoutPage.cardholderFirstName.should("have.value", "");
    checkoutPage.cardNumber.should("have.value", "");
    checkoutPage.email.should("have.value", "");
  });
});
