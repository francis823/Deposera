# Deposera

A website for Deposera, a fictional deposit-holding company in the Netherlands, created for a school project. Deposera holds rental deposits between tenants and landlords, photographs the home at move-in and move-out, runs a pre-inspection before move-out, and returns the deposit within 14 days (or 30 days if repairs are needed).

## Pages

- `index.html`: home page, with the drag-the-coin game in the hero
- `how-it-works.html`: steps for tenants and landlords, plus a timeline
- `pricing.html`: what's included, and who pays (letting agencies or independent landlords; free for tenants)
- `disputes.html`: damage, repairs and disputes, with an interactive repair checklist
- `faq.html`: frequently asked questions
- `about.html`: the problem, the mission and the team
- `contact.html`: a demo contact form (nothing is sent)
- `login.html` and `register.html`: demo log in and sign-up for the future Deposera app (nothing is saved or sent)

## App prototype

`app/index.html` is a clickable prototype of the Deposera app for tenants (demo only, all data is made up). It has four tabs:

- **Home**: the next step, your deposit, progress and key dates
- **Photos**: move-in photos by room, notes pinned to the exact spot, and a move-in/move-out comparison slider
- **Damage**: the pre-inspection list, choosing who fixes each item, a live estimate of what comes back (14 or 30 days), and disagreeing with an item
- **Records**: a dated timeline and documents

Use "Jump to a moment" to see the app at move-in, during the tenancy, before move-out and after key return. You can also open a moment directly, for example `app/index.html#preinspection`.

## How to open it

No build step is needed. Open `index.html` in a browser, or host the folder on GitHub Pages.

## Files

- `style.css`: all styling (forest green, cream and brass theme)
- `main.js`: the menu, scroll effects, coin game, tenant/landlord tabs, FAQ filter, repair checklist and form checks
- `assets/`: logo and favicon

Fonts (Cormorant Garamond and Inter) load from Google Fonts. Without an internet connection, the site falls back to Georgia and the system font.
