/**
 * `/feature/service-agreement/:planId` — five numbered acknowledgement statements, single
 * "I Agree" link (no modal on this step).
 */
class ServiceAgreementPage {
  // href varies by plan id (e.g. /feature/checkout/plan1), hence the prefix match.
  get agreeLink() {
    return cy.get('a[href^="/feature/checkout"]');
  }

  /** Agrees, advancing to /feature/checkout/:planId. */
  accept() {
    this.agreeLink.clickOnceAndWaitForUrl("/feature/checkout");
  }
}

export const serviceAgreementPage = new ServiceAgreementPage();
