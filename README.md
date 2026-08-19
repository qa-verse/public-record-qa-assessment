# Public Records Platform — QA Automation Suite

## Overview

Cypress + TypeScript end-to-end suite covering the search-to-checkout funnel of
`publicrecordsdata.us`, built for the Public Records Platform QA take-home assessment. Validates
layout stability, async/navigation resiliency, and checkout field behavior up to — but never
including — an actual purchase.

## Scope

- **Phase 1** — sanity audit of ticket PR-4092 (credit-card mask behavior).
- **Scenario 1** — search funnel, consent chain, layout stability, back-navigation resiliency.
- **Scenario 2** — sorting/pagination of a results grid. Genuinely unreachable in the live
  application at every tested search-result count — see "Known Limitations" below.
- **Scenario 3** — checkout gate: tier selection, invoice summary, field behavior, reload
  resiliency. No real purchase is ever submitted.

## Tech Stack

Cypress 14, TypeScript, Node. No additional test-runner plugins beyond Cypress's own.

## Project Structure

```
cypress/
  e2e/                     search-funnel.cy.ts, checkout-validation.cy.ts
  pages/                   Page Objects — one class per route: locators + business actions
  fixtures/                typed, synthetic test data (plan copy, billing data)
  support/
    commands.ts            cross-cutting custom Cypress commands
    types.ts                shared TypeScript types
  utils/
    funnel-navigation.ts   composes Page Object steps into one "reach checkout" helper
cypress.config.ts
tsconfig.json
package.json
BUGS.md
README.md
```

## Setup

```bash
npm install
```

No environment variables or accounts needed — every spec starts from a clean, unauthenticated
session and drives the public funnel directly.

## Running Tests

```bash
npm run cy:open              # interactive runner

npm run test                 # full suite, headed Chrome
npm run test:search          # search-funnel.cy.ts only, headed
npm run test:checkout        # checkout-validation.cy.ts only, headed
npm run test:core            # both specs by name, headed
npm run test:all             # everything matching the spec pattern, headed

npm run test:search:headless    # same specs, headless — see note below
npm run test:checkout:headless
npm run test:core:headless
npm run test:all:headless

npm run typecheck            # tsc --noEmit
```

**Headed Chrome is the reliable execution mode against the live target.** The site sits behind AWS
WAF Bot Control, which blocks headless Chrome with an empty `403`/`202` response — its JS challenge
never resolves, and every test fails within seconds. Ordinary headed Chrome passes the same
challenge a real visitor's browser would; no stealth or fingerprint evasion is used.
`cypress.config.ts` and the headed npm scripts default to `--headed` for this reason. The headless
scripts are kept available and are syntactically correct Cypress commands — they simply won't pass
against this particular target under the WAF's current behavior. This is an environment constraint
of the AUT, not a suite bug, and isn't worked around.

## Test Coverage

**Scenario 1** (`search-funnel.cy.ts`): search dialog + results-count disclaimer render without
horizontal overflow at desktop and mobile widths; consent-chain pages (age-verification, notice)
render without clipping; the app recovers cleanly from a browser-back triggered mid-transition; a
zero-match search shows a distinct dead-end state instead of crashing or silently advancing.

**Scenario 3** (`checkout-validation.cy.ts`): the funnel reaches the billing/payment page and
renders correctly; selecting a different pricing tier reshapes the order-summary panel (not just a
substituted number — recurring-plan language is fully replaced for a one-time tier); the
billing-address field reveals itself once card details are entered; a malformed email produces no
blur-time validation; a browser reload wipes all entered billing data. Submit-time field
validation (what happens when Confirm Payment is clicked) is documented, not automated — see
"Checkout Safety Boundary."

**Phase 1**: PR-4092 audited in `BUGS.md`.

## Architecture

- **Page Objects** (`cypress/pages/`) expose both locator getters and business-level actions
  (`homePage.searchByName(name)`, `packageSelectionPage.selectPlan(plan)`,
  `checkoutPage.assertOrderSummaryShows(...)`) — specs read as user actions, not raw selectors.
- **`cypress/support/commands.ts`** holds only genuinely cross-cutting behavior (WAF-wait,
  click-and-wait-for-URL, layout/viewport assertions). Page-specific behavior stays on its Page
  Object.
- **`cypress/utils/funnel-navigation.ts`**'s `navigateToCheckout()` composes Page Object steps for
  specs whose focus is *past* the funnel. `search-funnel.cy.ts`, whose focus *is* the funnel, calls
  the same underlying methods directly instead, so the steps under test stay visible.
- **`cypress/fixtures/`** holds only reusable, stable data: expected order-summary text per plan
  and synthetic billing data (the industry-standard test Visa number, never a real card).

## Locator Strategy

Real `id`/`name`/`href` attributes first, verified against the live DOM. Scoped `cy.contains()`
text-matching only when no stable attribute exists (e.g. a "Continue" button with no id). No
selector in this suite was guessed.

## Synchronization Strategy

No spec relies on a bare `cy.wait(ms)` as a synchronization primitive. Every wait is tied to an
observable state change — a URL changing, a dialog's `aria-hidden` flipping, an element's
visibility — via `cy.waitForWafChallenge()` / `elementChainable.clickOnceAndWaitForUrl(url)` in
`cypress/support/commands.ts`. A single click followed by a patient, state-based wait is used for
every transition, rather than a re-click loop — re-clicking a control mid-async-action can reset
it.

## Checkout Safety Boundary

Confirm Payment is never clicked, anywhere in this suite. `CheckoutPage` exposes only a
`confirmPaymentBtn` **getter**, not a `confirmPayment()`/`submit()` action method — the boundary is
part of the Page Object's API surface, not just a convention every spec has to remember.
`grep -rn "confirmPaymentBtn" cypress/` confirms every use is `.should(...)`, never `.click()`.

This isn't caution without cause: the checkout page contains two live 3-D Secure iframes
(`3DS-deviceFingerprinting`, `3DS-sendChallenge`), and the submit handler's actual payment call
delegates into a third-party payment-gateway SDK rather than a nameable first-party endpoint —
there was no way to build a network-blocking safeguard precise enough to guarantee no real
transaction request could leave the browser. A broader, heuristic blocker (block everything
cross-origin, block same-origin mutations) was considered and deliberately rejected, since this is
real production payment infrastructure this suite has no authorization to send test transactions
into, blocked downstream or not.

Submit-time validation behavior (what error messages appear when Confirm Payment is clicked with
invalid data) was therefore verified manually against the live application rather than through an
automated click, and is documented in `BUGS.md` accordingly — clearly separated from this suite's
own automated coverage.

## Known Limitations / Assumptions

- **Scenario 2 is not automated.** Tested three distinct search-result-count scenarios (too-many,
  moderate, zero matches) via the application's own search API and a full UI walk of each — none
  show a sortable/paginated candidate-record list; the funnel goes straight from the consent chain
  to tier selection every time. Eight plausible alternate routes were also checked directly and all
  404. This is a limitation of the live application as tested, not a gap in this suite's effort.
- **ZIP/postal-code format validation is unverified.** The billing-address field is a free-text
  address-autocomplete widget, not a dedicated ZIP input, and reveals correctly once card details
  are entered. Whether it enforces any format beyond "not blank" wasn't established.
- **Submit-time validation messages are manually observed, not independently automated** — see
  "Checkout Safety Boundary" above.
- The brief describes separate First/Last Name search inputs; the live application exposes a
  single "Full Name" field instead.

## Findings

See `BUGS.md` for the full PR-4092 audit and confirmed defects.
