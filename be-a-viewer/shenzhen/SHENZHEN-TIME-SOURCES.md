# Shenzhen Time Layer — source and interaction notes

## Editorial structure

The Shenzhen page now uses three scales of time:

1. **ROOTS** — archival material from the Shenzhen River boundary, the Kowloon–Canton Railway, Luohu and surviving views of the city.
2. **GROWTH** — a scroll-driven sequence centered on reform-and-opening-era urban expansion.
3. **TODAY** — the existing five-frequency field note (Bay / Crossing / Street / Ridge / Light).

The existing `DESIGN.md` remains the visual identity source of truth. The time layer uses the same ink, warm paper, signal red, tidal cyan and sodium amber.

## Primary growth visualization

NASA Scientific Visualization Studio, *Landsat-7 20-Year Urbanization of Shenzhen, China* (ID 2763).

- Source: https://svs.gsfc.nasa.gov/2763
- Sequence: 1973–2001
- Credit requested by NASA: NASA/Goddard Space Flight Center, Scientific Visualization Studio
- The page uses the NASA-hosted WebM and poster remotely and does not claim ownership.

## Historical image policy

The archive manifest uses Wikimedia Commons file pages and `Special:Redirect/file/` image endpoints. Low resolution, scratches, grain and uneven scans are intentionally preserved. Cards use `object-fit: contain` to avoid editorial cropping.

The archive deliberately does not impose a 1949 cutoff. The only topic-level hard block retained by the validator is 8964 / June Fourth material, matching the current site policy.

## Fact-check anchors

- Shenzhen Government city profile: https://www.sz.gov.cn/en_szgov/aboutsz/profile/content/post_12542766.html
- Shenzhen 2024 statistical bulletin: https://www.sz.gov.cn/cn/xxgk/zfxxgj/tjsj/tjgb/content/post_12190855.html
- Shenzhen port-development historical photo timeline: https://ka.sz.gov.cn/ztzl/katpz/kcks/index.html
- Shenzhen Government / Shennan Boulevard history: https://www.sz.gov.cn/szstory/202301/content/post_10363791.html
- World Bank, Shenzhen SEZ / urban land market study: https://documents1.worldbank.org/curated/en/622661468339570756/pdf/690730PUB0Publ067902B09780821389706.pdf

## Interaction decisions

The growth stage uses a sticky visual and ordinary document scrolling. Desktop continuously scrubs the NASA video with scroll progress; compact layouts use discrete milestone seeking to reduce repeated remote media seeks on mobile. Later steps crossfade verified historical / contemporary photographs over the satellite layer.

Motion follows the existing page preference contract: `prefers-reduced-motion` disables continuous scrubbing and reveal movement while preserving all text and images.
