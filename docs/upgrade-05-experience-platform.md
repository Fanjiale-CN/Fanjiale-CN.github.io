# Upgrade 05 — Experience Platform

## Released in the site repository

- **City Atlas** on `/cities/`: a lazy-loaded MapLibre map with an ivory editorial frame, red field markers, city selector, and five published cities — Beijing, Shanghai, Xi'an, Xiamen and Hangzhou.
- **One data source**: `data/city-atlas.json` supplies the city selector, map position, point annotation and destination route. Add or revise a city in that file instead of editing page markup.
- **Reader desk entry points**: About, Data, Research 001 and Research 002 each offer the same correction/source/note/collaboration interface in their local editorial voice.
- **Safe unavailable state**: until the Worker route is connected, pages retain a clear mail fallback instead of showing a broken form.
- **Release gate**: `npm run ci:experience` verifies the Atlas payload, lazy loading, all reader-desk entry points, worker safeguards and deployment handbook. It also runs through the main site validator on every push and pull request to `main`.

## Operator boundary

The repository contains the Worker source; deployment remains an account action because it binds a private R2 inbox and a Turnstile secret inside Cloudflare. Follow [the reader contact Worker setup](./reader-contact-worker.md) once. That process does not use, alter, or require the existing GitHub Actions Cloudflare token.

## What changes for visitors

| Surface | Visitor experience |
| --- | --- |
| `/cities/` | Scroll to **READ THE CITY IN POINTS**, choose a city, then select a red marker to open its editorial chapter. |
| `/about/` | Submit a correction, source or note after the Worker is connected. |
| `/data/` | Attach a public source URL or methodological objection to the relevant data page. |
| Research 001 and 002 | Send a correction or evidence link directly from the paper’s end matter. |

## Performance and privacy

The map library and base map are requested only when the City Atlas approaches the viewport. The site’s Hero and first screen do not wait for it. The reader client contains only a public Turnstile Site key; private validation and R2 writing happen in the Worker. R2 remains the durable record even when an optional downstream webhook cannot deliver.
