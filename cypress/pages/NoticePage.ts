/**
 * `/feature/notice` — third and final "I Agree" of the consent chain. A direct navigable link, no
 * in-page modal on this step (verified live 2026-08-19: href goes straight to /feature/package).
 */
class NoticePage {
  get agreeLink() {
    return cy.get('a[href="/feature/package"]');
  }

  /** Agrees, advancing to /feature/package. */
  accept() {
    this.agreeLink.clickOnceAndWaitForUrl("/feature/package");
  }
}

export const noticePage = new NoticePage();
