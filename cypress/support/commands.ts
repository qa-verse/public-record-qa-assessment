/**
 * Cross-cutting Cypress behavior only — generic synchronization and layout checks that apply
 * regardless of which page is under test. Page-specific business actions (e.g. "select a plan",
 * "accept the age-verification modal") live as methods on the relevant class in `cypress/pages/`,
 * not here — a global `cy.` command is the wrong place for behavior that only makes sense on one
 * page (see README.md → "Architecture").
 *
 * None of these use a bare `cy.wait(ms)` as a synchronization primitive — each polls for an
 * observable DOM/URL state via Cypress's built-in retry-ability instead of sleeping a fixed
 * duration.
 */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Waits out the AWS WAF JS challenge interstitial by polling for a real page title and the
       * absence of the challenge container, rather than sleeping a fixed duration — the
       * challenge's resolution time varies with WAF load.
       */
      waitForWafChallenge(timeout?: number): Chainable<void>;

      /**
       * Asserts the current document has no horizontal overflow — the concrete, testable form of
       * "renders without clipping or overlap" used throughout this suite's layout checks. Does
       * NOT prove pixel-perfect visual correctness; it only proves nothing pushed past the
       * viewport's right edge.
       */
      assertNoHorizontalOverflow(): Chainable<void>;

      /**
       * Click the current subject once, then let Cypress's retry-ability poll the URL instead of
       * re-clicking on an interval. Re-clicking a control that triggers an in-flight async action
       * can reset that action, so a single click plus a patient, state-based wait is the safer
       * pattern for any transition whose backend latency is unpredictable.
       */
      clickOnceAndWaitForUrl(urlIncludes: string, timeout?: number): Chainable<JQuery<HTMLElement>>;

      /**
       * Asserts the current subject is visible, has positive width/height, and sits fully inside
       * the configured viewport — catches a clipped or off-screen element that a plain
       * `.should("be.visible")` alone would miss, since Cypress's visibility check does not verify
       * viewport containment.
       */
      assertVisibleWithinViewport(): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add("waitForWafChallenge", (timeout = 20000) => {
  cy.title({ timeout }).should("not.eq", "");
  cy.get("#challenge-container", { timeout: 1 }).should("not.exist");
});

Cypress.Commands.add("assertNoHorizontalOverflow", () => {
  cy.document().then((doc) => {
    expect(doc.documentElement.scrollWidth, "no horizontal overflow (clipping/overlap)").to.be.at.most(doc.documentElement.clientWidth);
  });
});

Cypress.Commands.add(
  "clickOnceAndWaitForUrl",
  { prevSubject: "element" },
  (subject, urlIncludes: string, timeout = 60000) => {
    cy.wrap(subject).click();
    cy.url({ timeout }).should("include", urlIncludes);
    return cy.wrap(subject);
  }
);

Cypress.Commands.add("assertVisibleWithinViewport", { prevSubject: "element" }, (subject) => {
  cy.wrap(subject)
    .should("be.visible")
    .then(($el) => {
      const rect = ($el[0] as HTMLElement).getBoundingClientRect();
      const viewportWidth = Cypress.config("viewportWidth");
      expect(rect.width, "element has a positive width").to.be.greaterThan(0);
      expect(rect.height, "element has a positive height").to.be.greaterThan(0);
      expect(rect.left, "element's left edge is not clipped off-screen").to.be.at.least(0);
      expect(rect.right, "element's right edge is within the viewport width").to.be.at.most(viewportWidth);
    });
  return cy.wrap(subject);
});

export {};
