# Galok observability operator guide

## What is in the repository

- GA4 measurement ID: `G-2Y8N04VXYG`
- Microsoft Clarity project ID: `y7uoedckle`
- `scripts/sync-observability.mjs` writes one shared analytics block into every canonical URL in `sitemap.xml` and removes it from redirects, 404s, archives and source pages.
- `assets/observability.js` records only content opens, archive use, research contents use, city media events and outbound-link clicks. Archive search records the active filter and query length; it never sends the text entered by a visitor.

## Cloudflare dashboard actions

These settings live in the Cloudflare account and cannot be truthfully changed from this repository.

1. Open **Websites → galok.me → Analytics & Logs → Web Analytics**. Create or enable the site token, then add the supplied Web Analytics snippet through **Zaraz** or the site head. Confirm the dashboard starts receiving page views before treating RUM as enabled.
2. Open **Speed → Optimization**. Keep **Brotli** and **HTTP/3** enabled. Enable **Speed Brain** only after testing homepage → Essays, Essays → article, Research → paper and Cities → city page. Leave **Early Hints** unchanged unless Cloudflare reports a concrete preload benefit.
3. Under **Caching → Cache Rules**, keep the existing immutable cache policy for versioned `media.galok.me` assets. Do not add a broad HTML “Cache Everything” rule.

## R2 health object

Run the GitHub Action **Publish Galok media health object** with confirmation `PUBLISH_GALOK_MEDIA_HEALTH`. It creates `health.txt` at the root of the `galok-media` bucket with exactly:

```text
GALOK MEDIA OK
```

Verify `https://media.galok.me/health.txt` returns HTTP 200 before adding its monitor.

## UptimeRobot monitors

`Galok/main` for `https://www.galok.me/` already exists. Add the following HTTP(s), GET, 5-minute, email-alert monitors after the media health URL works:

| Name | URL |
| --- | --- |
| Galok/media | https://media.galok.me/health.txt |
| Galok/cities | https://www.galok.me/cities/ |
| Galok/essays | https://www.galok.me/essays/ |
| Galok/research | https://www.galok.me/research/ |
| Galok/data | https://www.galok.me/data/ |
| Galok/index | https://www.galok.me/index/ |
| Galok/research-001 | https://www.galok.me/research/who-captures-growth/ |
| Galok/research-002 | https://www.galok.me/research/fast-metabolism-economy/ |

## Reading the data

- GA4: traffic source, content entry and the named product events.
- Clarity: recordings, heatmaps, rage clicks, dead clicks and scroll depth.
- Cloudflare Web Analytics: RUM performance, including LCP, INP, CLS, device and country differences.
- GitHub Actions: release checks, resource budget and Lighthouse baseline. It does not replace uptime monitoring.
