# Radar data architecture

`radar/signals.json` is the verified public fallback. `workers/radar` is an optional edge adapter for GDELT DOC 2.0. It emits the same versioned shape, caches successful normalized responses for 15 minutes and can serve the checked-in snapshot when upstream discovery is unavailable. New upstream matches enter only as `Signal`; promotion to Brief, Lead or Archive is an editorial action.

The browser validates version, states, timestamps and evidence arrays before rendering. URLs are restricted to HTTP(S). The repository validator rejects generic section landing pages: evidence must resolve to a specific report or a specific Galok publication. Source links open independently and retain outlet names.
