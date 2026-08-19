import { homePage } from "../pages/HomePage";
import { ageVerificationPage } from "../pages/AgeVerificationPage";
import { noticePage } from "../pages/NoticePage";

// This spec calls homePage/ageVerificationPage/noticePage's own step methods directly and
// individually (the same methods `navigateToCheckout()` composes for other specs) rather than
// going through that aggregate helper — these tests exist to verify the search + consent-chain
// steps themselves, so each step stays visible here instead of being hidden behind one opaque call.

describe("Search Funnel & Processing Interface (Scenario 1)", () => {
  it("renders the search dialog and results-count disclaimer without clipping, at desktop and mobile widths", () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    homePage.visit();
    cy.waitForWafChallenge();
    cy.assertNoHorizontalOverflow();

    homePage.openSearchDialogTrigger.click();
    homePage.searchPopupDialog.should("be.visible").assertVisibleWithinViewport();
    cy.assertNoHorizontalOverflow();

    homePage.fullNameInput.type("James Smith", { delay: 40 });
    homePage.searchSubmitBtn.click();
    homePage.resultsCountDialog.should("be.visible").assertVisibleWithinViewport();
    homePage.resultsCountContinueBtn.assertVisibleWithinViewport();
    cy.assertNoHorizontalOverflow();

    // Responsive check (brief's "responsive interactions"): re-verify at a mobile viewport width.
    cy.viewport("iphone-x");
    cy.assertNoHorizontalOverflow();
    homePage.resultsCountDialog.assertVisibleWithinViewport();
  });

  it("renders the age-verification and notice consent pages without clipping", () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    homePage.visit();
    cy.waitForWafChallenge();

    homePage.searchByName("James Smith");
    homePage.acceptResultsCountDisclaimer();
    cy.assertNoHorizontalOverflow();
    ageVerificationPage.pageAgreeBtn.assertVisibleWithinViewport();

    ageVerificationPage.accept();
    cy.assertNoHorizontalOverflow();

    noticePage.agreeLink.should("be.visible").assertVisibleWithinViewport();
  });

  it("recovers to a working home page when navigating back mid-transition", () => {
    // No discrete loading/processing spinner exists in this funnel — transitions render directly.
    // The closest testable form of "back-step navigation mid-load" is navigating back immediately
    // after starting a transition. Deliberately clicks the raw `resultsCountContinueBtn` (not
    // `homePage.acceptResultsCountDisclaimer()`, which would wait for the navigation to finish
    // first) — the whole point of this test is to interrupt that wait.
    cy.clearCookies();
    cy.clearLocalStorage();
    homePage.visit();
    cy.waitForWafChallenge();

    homePage.searchByName("James Smith");
    homePage.resultsCountDialog.should("be.visible");
    homePage.resultsCountContinueBtn.click(); // starts navigating to /feature/age-verification

    cy.go("back");

    cy.location("pathname").should("eq", "/");
    homePage.openSearchDialogTrigger.should("be.visible");
    cy.get("body").invoke("text").its("length").should("be.greaterThan", 200);
  });

  it("shows a distinct no-results message for a zero-match search, without crashing or advancing the funnel", () => {
    // Discovered live: a genuinely zero-match search does NOT show the normal results-count
    // disclaimer at all — it shows a completely different dead-end dialog ("Your search returned
    // no results. Please try a different search" + a Back button only, no Continue link) and
    // never advances past "/". Verified via the site's own tlo/teaser/summary search API before
    // walking the UI: this exact name returns {tooManyResults: false, numberOfRecords: 0}. An
    // invented, syntactically-unusual name is used specifically because it's about as safe a bet
    // as this kind of test can make that a live public-records database will never actually match
    // it — the same practical assumption "James Smith" relies on for the opposite (guaranteed
    // too-many-results) case elsewhere in this suite.
    cy.clearCookies();
    cy.clearLocalStorage();
    homePage.visit();
    cy.waitForWafChallenge();

    homePage.searchByName("Wulfric Thistlewood");
    homePage.noResultsDialog.should("be.visible").and("contain.text", "no results");
    cy.assertNoHorizontalOverflow();

    homePage.noResultsBackBtn.click();
    // A closed HTML5 <dialog> stays in the DOM without its `open` attribute (same pattern as the
    // other dialogs in this funnel) — it isn't removed, so assert on that attribute, not existence.
    homePage.noResultsDialog.should("not.have.attr", "open");
    cy.location("pathname").should("eq", "/");
    homePage.openSearchDialogTrigger.should("be.visible");
  });
});
