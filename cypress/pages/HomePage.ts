/**
 * `/` — search entry point plus the results-count/FCRA disclaimer dialog that appears on the same
 * page after submitting a search. All selectors verified against the live DOM.
 */
class HomePage {
  visit() {
    cy.visit("/");
  }

  get openSearchDialogTrigger() {
    return cy.get('[data-search-dialog="people"]').first();
  }

  get searchPopupDialog() {
    return cy.get("#people-search-popup-dialog");
  }

  get fullNameInput() {
    return cy.get("#peopleSearch-input");
  }

  get searchSubmitBtn() {
    return cy.get("#people-search-btn");
  }

  // Record-count + FCRA disclaimer shown after submitting the search form. Appearance depends on
  // backend search-processing latency, hence the extended timeout.
  get resultsCountDialog() {
    return cy.get("#people-search-dialog", { timeout: 20000 });
  }

  get resultsCountContinueBtn() {
    return cy.get("#search-continue");
  }

  // A genuinely zero-match search reuses the SAME #people-search-dialog element (confirmed live:
  // it gains a "no-results" class rather than being a separate dialog) but swaps its content to a
  // dead-end "no results" message with only a Back button — it never offers a Continue link and
  // never advances the funnel. Scoped by the no-results class so this doesn't collide with the
  // normal results-count dialog above.
  get noResultsDialog() {
    return cy.get("#people-search-dialog.no-results", { timeout: 20000 });
  }

  get noResultsBackBtn() {
    return this.noResultsDialog.contains("button", /back/i);
  }

  /** Opens the search dialog, types a full name, and submits — the funnel's entry action. */
  searchByName(name: string) {
    this.openSearchDialogTrigger.click();
    this.searchPopupDialog.should("be.visible");
    this.fullNameInput.type(name, { delay: 40 });
    this.searchSubmitBtn.click();
  }

  /**
   * Accepts the record-count/FCRA disclaimer, advancing to /feature/age-verification.
   * `resultsCountContinueBtn` is still exposed on its own so a test that specifically wants to
   * interrupt this exact transition (e.g. the back-navigation-mid-load check in
   * search-funnel.cy.ts) can click it directly without this method's built-in wait.
   */
  acceptResultsCountDisclaimer() {
    this.resultsCountDialog.should("be.visible");
    this.resultsCountContinueBtn.clickOnceAndWaitForUrl("/feature/age-verification");
  }
}

export const homePage = new HomePage();
