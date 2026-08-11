# Requirement-to-execution decisions

| Requirement | Decision | Evidence | Acceptance check |
|---|---|---|---|
| Fix the Galok design style | Use one six-token editorial palette, two type families, square geometry and hairline rules across About and film | `about/about.css`, `planning/DESIGN.md` | Desktop and mobile captures show one coherent system |
| Make a Minimal Zine Poster v0.1 | Generate one 3:5 paper specimen with 78–85% negative space, torn map cluster and one saturated red anchor | `assets/about/galok-field-note-poster.webp`, `poster-prompt.md` | 1200×2000, inspected at thumbnail size |
| Build a real About page | Hero manifesto, archive entry spine, film, method and contact | `about/index.html` | Page capture includes all five sections |
| Contact only by email and X | Remove Medium and Selected Works from contact state; use `galokview@outlook.com` and `@galokview` | About contact section and footer | Search of About HTML returns no Medium link |
| Make and embed a promotional video | Produce one 36-second H.264 film from real Galok pages and city footage; embed with controls and metadata preload | `assets/about/galok-brand-film.mp4`, About `<video>` | 1920×1080, 30fps, 36.00s, browser asset returns 200 |
| Do not repeat the frightening audio problem | Create a silent composition and strip every audio stream from the final MP4 | Render config `--muted`, final `ffprobe` | Audio stream count is zero |
| Show all content | Include brand, homepage, four named cities, Works, Notes, Data, Archive and About | `storyboard.md`, final film | Every required feature has a readable visual state |
| Keep motion refined | Use restrained deterministic movement, a second city event wave, true data reveal and 30-frame camera settles | `src/GalokBrandFilm.tsx` | No shake/glint; page pushes stop before cuts; no blank boundary frames |
| Keep feature claims truthful | Use only real page captures, existing city footage and exact CPI values from `data/data.js` | `capture.mjs`, source mapping | No reconstructed page substitutes or invented data |
| Make the destination readable | Use a 64px `LOOK CLOSER. / GALOK.ME` CTA fully visible by f1040 and held through f1079 | Outro source and key frame | ≥40-frame full hold, readable at 480px review width |
| Respect Galok's quiet ending | Deliberately reject Shotcraft Q8's high-energy feature-family climax | `DESIGN.md` deliberate exception | End remains calm but has a strong mark, URL and >1s hold |
| Deploy directly to main | Validate assets, page, video and independent review before committing the exact tested files | Git commit and remote ref | Remote `main` points to tested commit |
