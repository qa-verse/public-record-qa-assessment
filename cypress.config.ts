import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "https://www.publicrecordsdata.us",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    // The site's backend "compilation" / search-processing step and the
    // AWS WAF JS challenge on first load both introduce real, variable
    // network latency, so default command/page-load timeouts are raised
    // beyond Cypress defaults. Individual waits still prefer explicit
    // cy.intercept()/state-based assertions over relying on this ceiling.
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    viewportWidth: 1366,
    viewportHeight: 900,
    video: false,
    screenshotOnRunFailure: true,
    retries: {
      runMode: 0,
      openMode: 0,
    },
    chromeWebSecurity: true,
  },
});
