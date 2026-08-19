import "./commands";

Cypress.on("uncaught:exception", () => {
  // The app under test is a third-party production site; we assert on
  // observable UI state, not on its internal JS error handling, so an
  // uncaught exception in app code should not fail unrelated assertions.
  return false;
});
