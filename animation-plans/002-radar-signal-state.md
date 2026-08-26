# Radar signal-state motion plan

## Intent

Make changes in editorial state easy to follow while keeping the page calm enough for sustained reading.

## Approved motions

- Filter change: 180ms opacity/translate transition on the result rows; the control state changes immediately.
- Evidence drawer: 200ms opacity and 8px vertical entry. Native dialog retains Escape and focus-return behavior.
- Time rail: 160ms ink-color change when the observed row becomes current.
- Coverage trace: one 220ms scale transition on initial row entry; no loop.

## Guardrails

- No autoplay sequence, parallax, continuous ticker or decorative counter.
- No layout animation on reading text.
- Reduced-motion mode removes every transition and scroll behavior.

