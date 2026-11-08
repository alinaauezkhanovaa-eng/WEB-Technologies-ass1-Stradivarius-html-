# Stradivarius Mega Silkway — Introduction to Web Technologies, endterm

Student project about the Stradivarius store in Mega Silkway, Astana.
Same repository and same pages as in the earlier assignments. Tag: `endterm`.

Open `index.html` in a browser (or serve the folder with any static server). No build step, no server:
the cart, the accounts and the signed-in visitor are kept in the visitor's own `localStorage`.

## Plain JavaScript and jQuery are kept apart

| File | Kind | Page | What it does |
|---|---|---|---|
| `js/store.js` | plain JS | all pages | saved cart, accounts and session; cart badge and "Hi, name" link in the header |
| `js/catalog.js` | plain JS | Collection | builds all 12 product cards from the `PRODUCTS` array with loops; delegated "Add to cart" handler |
| `js/cart.js` | plain JS | Cart | renders the cart, quantity buttons (delegated), totals, validated order form, confirmation |
| `js/registration.js` | plain JS | Sign up or Login | validated sign-up and login against saved accounts, log out |
| `js/about-stradivarius.js` | plain JS | About the Store | opening-hours table built from `OPENING_HOURS`, open/closed status with time left |
| `js/catalog-search.js` | jQuery | Collection | search + category filter, live counter, "nothing found" with a way back |
| `js/care.js` | jQuery | Style & Care | collapsible care guide, step checklist with progress, validated inquiry form |
| `js/visit-and-feedback.js` | jQuery | Visit & Feedback | validated visit / feedback form, purpose-dependent date limits and hint |
| `js/form-utils.js` | jQuery helper | Care, Visit | shared validation and message helpers for the two jQuery forms |

A feature is either plain JS or jQuery. The only contact point is the Collection page: `catalog.js` builds the
cards, `catalog-search.js` filters the finished cards.

## What was added since each feature was last defended

- **Collection**: the 12 cards are no longer in the HTML — they are built from an array; the missing-size error is shown
  next to the select instead of `alert()`; limit of 10 pcs per line; the search got a category filter, a live
  "Showing N of 12" counter and a "Show all items" button when nothing is found.
- **Cart**: the order form was only `required` + `alert()`. Now name, phone and e-mail are validated in code
  (trim, error under each wrong field, error disappears when fixed, confirmation only when all checks pass).
  The confirmation lists the items, the total and the pickup deadline (now + 48 hours, as the page promises).
  Quantity buttons are delegated and the "+" button stops at the limit. The form is pre-filled for a signed-in visitor.
- **Sign up or Login**: the form only validated and said "OK". Now sign-up saves an account (duplicate e-mail is
  rejected), login checks e-mail and password against the saved accounts, the header shows "Hi, name" on every
  page, there is a "Log out" button. The dead "Continue with Google" button was removed (no server, cannot work).
- **About the Store**: the two hand-written table rows were replaced by 7 rows built from `OPENING_HOURS`
  (today's row is highlighted); the status line now says how long the store stays open / when it opens.
- **Style & Care**: the page loaded no script at all, so the guide, the form and the checklist were dead.
  Scripts are now connected; the step highlight became a checklist with a progress line; decorative table-row
  hover and the always-on first highlighted step were removed.
- **Visit & Feedback**: choosing the purpose now limits the date picker (feedback: today or earlier; fitting /
  consultation: today or later) and shows a hint.
- **Every page**: cart badge and account link in the header (`store.js`).
- Removed `js/old-js-version.js` (an unused plain-JS copy of jQuery features).

## Who wrote what

Pages and stylesheets follow the earlier assignments (`alina.css` / `zhamilya.css`).

| Part | Author |
|---|---|
| Collection page, `catalog.js`, `catalog-search.js` | Alina |
| Cart page, `cart.js`, `store.js` | Alina |
| Sign up or Login, `registration.js` | Zhamilya |
| Style & Care, `care.js` | Alina |
| Home, About the Store, `about-stradivarius.js` | Zhamilya |
| Visit & Feedback, `visit-and-feedback.js`, `form-utils.js` | Zhamilya |

## Known limits (no server)

- Accounts, cart and session live only in the browser of the visitor; the password is stored as typed because there is no
  server to hash it. Nothing is sent anywhere — every confirmation says so.
- Orders are reservations for pickup in the store (pay in the store), as the cart page states.
