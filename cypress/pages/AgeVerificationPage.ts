/**
 * `/feature/age-verification` — full Terms of Service text plus a page-level "I Agree" that opens
 * an in-page disclaimer modal with its own, second "I Agree".
 */
class AgeVerificationPage {
  // Opens the #disclaimer-dialog modal below. This id looks like it should belong to the modal's
  // agree control, but it doesn't — it's the page-level button that opens the modal. Re-clicking
  // it a second time (mistaking it for the modal's own agree control) is a no-op and was the root
  // cause of an earlier intermittent "dead-end I Agree" flake before this was corrected.
  get pageAgreeBtn() {
    return cy.get("#disclaimer-dialog-btn");
  }

  get disclaimerDialog() {
    return cy.get("#disclaimer-dialog");
  }

  // The modal's real "I Agree" control is a plain navigable <a href="/feature/notice">, not a
  // button, and carries no id — targeted by its stable href instead.
  get disclaimerDialogAgreeLink() {
    return cy.get('#disclaimer-dialog a[href="/feature/notice"]');
  }

  /** Opens the modal via the page-level button, then agrees inside it — advances to /feature/notice. */
  accept() {
    this.pageAgreeBtn.click();
    this.disclaimerDialog.should("have.attr", "aria-hidden", "false");
    this.disclaimerDialogAgreeLink.clickOnceAndWaitForUrl("/feature/notice");
  }
}

export const ageVerificationPage = new AgeVerificationPage();
