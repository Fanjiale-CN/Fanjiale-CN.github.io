# Galok Design References

This directory contains external design-system references for agent-assisted UI work.

## Installed library

### awesome-design-md

- Upstream: `VoltAgent/awesome-design-md`
- Installed as a Git submodule at `design-references/awesome-design-md`
- Pinned source commit: `8147538b4226ae41e2487a9179e3bcc1f68e8554`
- Source archive supplied for this installation matches that commit.
- License: MIT (see the submodule repository).

Clone with submodules:

```bash
git clone --recurse-submodules <repo-url>
```

For an existing checkout:

```bash
git submodule update --init --recursive
```

Update deliberately, never implicitly:

```bash
cd design-references/awesome-design-md
git fetch origin
git checkout <reviewed-commit>
cd ../..
git add design-references/awesome-design-md
```

## How Galok uses the library

The files in this directory are references, not templates to apply wholesale.

1. Read the root `DESIGN.md` first. It is authoritative.
2. Open only the reference systems relevant to the task.
3. Extract principles, tokens, hierarchy, layout logic, motion constraints, and anti-patterns.
4. Re-express those principles in Galok's own visual language.
5. Never copy a third-party brand identity, proprietary font requirement, logo treatment, or distinctive branded composition directly.
6. Any reusable Galok rule discovered through a reference must be documented back in the root `DESIGN.md` or the relevant Galok design-system documentation.

## Useful starting references

- `design-md/wired/DESIGN.md` — editorial hierarchy and long-form reading.
- `design-md/theverge/DESIGN.md` — strong editorial identity and information rhythm; use selectively because its visual language is deliberately loud.
- `design-md/apple/DESIGN.md` — whitespace, photography hierarchy, and restrained interface chrome.
- `design-md/linear.app/DESIGN.md` — precision, hairlines, hierarchy, and disciplined UI states.
- `design-md/notion/DESIGN.md` — content structure and product-document organization.
- `design-md/vercel/DESIGN.md` — minimal technical surfaces and label systems.
- `design-md/ibm/DESIGN.md` — data-heavy layouts, square geometry, and information systems.
- `design-md/runwayml/DESIGN.md` — cinematic image-led editorial treatment.
- `design-md/ferrari/DESIGN.md` — full-bleed imagery and sparse high-impact accent use.

These references are ingredients. Galok remains the finished cuisine.
