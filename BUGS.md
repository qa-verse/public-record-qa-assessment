# Bug Reports

## PR-4092 Sanity Audit

**Ticket as filed:** "The form doesn't block the user when they put spaces in the credit card
number field. It just lets them proceed. We should fix the mask regex or add a blocking error
message under the field."

### Observed

Typing `"4111 1111 1111 1111"` into the card-number field on `/feature/checkout/plan1` results in
the field's actual value becoming `4111-1111-1111-1111` — spaces are converted into dash separators
in real time, not passed through raw. Typing pure garbage (`abcd1234abcd5678`) produces
`1234-5678` — letters are stripped, digits are kept and grouped. No error message appears in either
case.

### Assessment

The ticket's observation (no error shown) is accurate, but its diagnosis is wrong. There's an
active input mask running, and it already handles spaces by folding them into its own separator
format — a different defect class than "doesn't block spaces." The proposed fixes (regex the mask,
add a blocking message) target a mask that isn't actually broken.

### Recommendation

Close as invalid, or re-scope to the one question this audit couldn't answer: whether the dashed
value is correctly stripped to pure digits before being sent to the payment processor. That's a
server-side question, unreachable without submitting a real payment — out of scope for this suite.

## Confirmed Defects

### BUG-001 — Plan-selection radio buttons have no accessible name

**Severity:** Medium · **Area:** Accessibility / Package Selection

On `/feature/package`, each of the four pricing-tier radio inputs is wrapped in a `<label>`, but
the label's text content is empty — the actual price/plan copy lives in sibling elements outside
the label association. A screen reader announces each option as just "radio," with no way to
distinguish the $420/12-month plan from the $1 one-time option. Confirmed via both direct DOM
inspection (`label[for="oneYear"]` has empty `textContent`) and the browser's live accessibility
tree (every option reads back with no accessible name).

### BUG-002 — Search modal has no discoverable close control

**Severity:** Low · **Area:** UX / Search

On the home page, opening the search modal (`#people-search-popup-dialog`, via either the "SEARCH
NOW" button or the Full Name search control — both open the same dialog) provides no visible way to
dismiss it: no X, no Cancel button, and clicking the backdrop does nothing (confirmed by dispatching
a click outside the dialog's bounds and checking it stayed open). The modal does close on the
Escape key — that's the native `<dialog>` element's default behavior, confirmed live — but that
isn't a discoverable affordance for a user who hasn't already learned to try it. Reported narrower
than initially suspected: the modal isn't a true dead-end (Escape works), it's missing a visible
close control.

## Limitations

### Scenario 2 — results grid unavailable

The brief describes a sortable/paginated list of candidate records (Age, Location, History
columns). Tested three distinct search-result-count scenarios (a very common name, a moderately
common name, and an intentionally rare name) via the application's own search API and a full UI
walk of each — in every case, the funnel goes straight from the consent chain to tier selection; no
such list ever appears. Eight plausible alternate routes were also checked directly and all
returned 404. Not automated, since there's nothing live to automate against.

### ZIP/address validation

The billing-address field (`#address-search-input`) is a free-text address-autocomplete widget, not
a dedicated ZIP input. It's hidden on initial page load and reveals itself once card details are
entered — confirmed working, not broken. What exact format validation it enforces beyond "not
blank," if any, wasn't established without triggering a real checkout submission, which is out of
scope — see README.md → "Checkout Safety Boundary."

### Email/CVV validation messaging

Source-level inspection of the checkout form's validation logic (safe to read; not executed) shows
the email field runs a single check for both an empty and a malformed value, surfacing the same
"Invalid email" message either way, rather than a distinct "required" message for the empty case.
CVV appears to follow the same one-message pattern. First/Last Name, by contrast, do distinguish
the two cases ("must include at least 1 character" vs. "Invalid First/Last Name"), and do trim
whitespace before checking length — a whitespace-only name is correctly rejected as empty, not
accepted. Minor enough (a wording choice, not a functional gap) that it's noted here rather than
logged as a defect.
