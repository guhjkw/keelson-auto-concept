# Keelson Auto Care: Squarespace 7.1 concept

A multi-page front-end prototype for an independent auto repair shop: upfront starting prices, a filterable service menu, a five-step booking flow, and plain-English warranty and policy pages.

> **Concept project, fictional brand.** Keelson Auto Care is a fictional business invented for this portfolio piece. The address (123 Example Street, Harbor District), phone number (+1 (555) 0100) and email (hello@keelson.example) are placeholders. There are no testimonials, reviews, ratings or client claims. Forms and bookings are demos: they validate in the browser, show an on-page confirmation and send no data. Prices are sample figures.

## The brief it answers

Paraphrased from real Upwork job posts (October 2026):

- **"Squarespace Automotive Website Redesign"** ($800 fixed): restructure the layout, refine the visual presentation, make navigation and content organization clearer, and provide an assessment of the current site with recommendations.
- **A related auto body shop brief:** add privacy and terms pages, make the site ADA accessible and Google Ads ready from a compliance point of view.

## Pages

| Page | What it shows |
| --- | --- |
| `index.html` | Home: hero with a digital inspection illustration, promises strip, service categories with starting prices, how a visit works, hybrid and EV feature, FAQ accordion, location and hours, call to action |
| `services.html` | Service menu: 22 services with starting-at prices, category filters, a details dialog per service, pricing notes |
| `book.html` | Booking flow: vehicle, services, date and time, contact, review, then a demo confirmation |
| `about.html` | The shop, what to expect (five-step timeline), the 24-month / 24,000-mile warranty, nine shop policies |
| `redesign-notes.html` | Designer's case notes: site assessment, six redesign decisions, navigation before and after, Squarespace build plan, launch checklist |
| `privacy.html` | Privacy policy, clearly marked as a sample template and not legal advice |
| `terms.html` | Terms of service, clearly marked as a sample template and not legal advice |
| `accessibility.html` | Accessibility statement: target, measures, testing, known limitations, other ways to book |

## Features

- **Service menu with "starting at" prices and filters** (Maintenance, Brakes, Diagnostics, Tires, Hybrid and EV). Filter buttons use `aria-pressed`, the result count is announced, and filters can be linked directly, for example `services.html#brakes`.
- **Service details dialog** built on the native `<dialog>` element: Esc closes it, Tab stays inside, and focus returns to the button that opened it. "Book this service" pre-selects that service in the booking form (`book.html?service=brake-pads`).
- **Multi-step booking form**: vehicle (year, make, model, mileage, powertrain), services, date and time slot, contact, review and demo confirmation. It has a progress indicator with `aria-current="step"`, Back and Next buttons, inline validation with a linked error summary, a running starting estimate, Edit links on the review step, and focus moved to each new step heading. The page title updates per step.
- **What to expect, warranty and policies** in plain English, each with its own anchor (`about.html#process`, `#warranty`, `#policies`).
- **Accessibility first**: skip link, high contrast palette, 44 pixel touch targets, visible focus, accessible step form, keyboard-operable filters, dialog and mobile menu.
- **Squarespace-style shell**: announcement bar, header with navigation and a primary button, burger menu on mobile, footer with a newsletter block and placeholder social icons.

## How it maps to Squarespace 7.1

| Feature in this prototype | Squarespace 7.1 implementation |
| --- | --- |
| Header, navigation, Book button | Site Header with the header button enabled and fixed positioning on scroll; burger menu on mobile |
| Announcement strip | Announcement Bar |
| Light, dark, steel and orange sections | Page sections using Site Styles color themes |
| Service menu and filters | List section (cards) or a Summary block filtered by category tags; the filter bar is a small Code block; details in a lightbox or on item pages |
| Booking flow | Scheduling block (Acuity Scheduling): one appointment type per service, intake form questions for vehicle details, automatic confirmations and reminders |
| FAQ | Accordion block |
| Location map | Map block (an illustration is used here so the concept makes no external requests) |
| Newsletter | Newsletter block connected to Squarespace Email Campaigns |
| Privacy, terms, accessibility pages | Standard pages linked from the footer; cookie banner turned on before any analytics or ad tags |
| Focus styles and skip link | Custom CSS, plus code injection where the template needs it |

## Tech notes

- Plain HTML, CSS and vanilla JavaScript. No frameworks, no build step, no CDNs and no external requests of any kind.
- Flat folder, ready for the GitHub web uploader: 8 HTML pages, `styles.css`, `app.js` (under 500 lines), `favicon.svg`, five `.woff2` font files, this README and `.nojekyll`.
- All illustrations (inspection report car, drive-on lift, EV battery pack, map) and icons are hand-written SVG. Icons are drawn from an inline `<symbol>` sprite on each page, so they work from `file://`.
- No cookies, storage, analytics or network calls. Booking days are generated from today's date (closed Sundays); "booked" time slots follow a fixed pattern so the demo looks realistic without randomness.

## Run locally

Open `index.html` in any modern browser. Everything works from `file://`, so no server is needed. To publish, upload the folder contents to a GitHub repository and turn on GitHub Pages.

## Accessibility notes

- Target: WCAG 2.2 Level AA.
- Skip link, landmarks, one `h1` per page and a logical heading order.
- Every text and interface color pair checked for AA contrast; visible focus outlines tuned for each section theme.
- Touch targets at least 44 by 44 pixels for buttons, navigation, filters and form controls.
- A label on every field, hints and errors linked with `aria-describedby`, and an error summary that receives focus and links to each field.
- Filters, the details dialog and the mobile menu work by keyboard (Esc closes, focus is trapped and returned).
- `prefers-reduced-motion` turns off smooth scrolling, transitions and the pulsing inspection markers.
- Decorative SVG is hidden with `aria-hidden`; the inspection illustration has a full text alternative.
- Checked with automated structure, link and contrast scripts and keyboard-only testing in Chrome at 375, 768 and 1440 pixels. Screen reader testing (NVDA, VoiceOver) is on the launch checklist.

## Fonts

- **Barlow Condensed** (600, 700) for headings and **Barlow** (400, 500, 600) for body text, copyright The Barlow Project Authors, licensed under the SIL Open Font License 1.1. Self-hosted latin subsets from the Fontsource packages `@fontsource/barlow-condensed` and `@fontsource/barlow`.

## Credits

Concept, copy, illustrations and build by Emmanuel O. for an Upwork portfolio. Keelson Auto Care is a fictional business.
