# Work / Codex Development Prompts

These prompts are the maintained entry points for future Galok development. Copy the relevant prompt and append the actual feature request.

## A. Normal feature / content development

```text
Work on the Galok repository as a production engineering task.

Before changing anything:
1. Read the repository-root AGENTS.md in full.
2. Read docs/engineering/DEVELOPMENT_STANDARD.md.
3. Read every domain standard relevant to this task (Discovery, Typography, CI, Failure Playbook).
4. Inspect the current branch, git status, the exact files/routes involved, and the current implementation before editing.

Hard rules:
- Never develop or push directly on main. Create/use a feature/fix/chore/work branch.
- Do not create a temporary/once/preflight/retry/installer GitHub Actions workflow.
- Do not bypass, weaken, delete, or replace validators to make CI green.
- Do not hand-edit deterministic generated discovery files as the primary fix.
- Do not rebuild frozen base fonts for routine content.
- A preferred-font glyph miss is allowed if the canonical project-owned fallback stack resolves it.
- package.json and package-lock.json must remain synchronized.
- Keep implementation logic in normal source files or scripts/, not encoded inside workflow YAML.

Development sequence:
1. Implement the requested source change.
2. Run `npm run galok:prepare`.
3. Inspect `git diff` and `git status --short`.
4. Ensure source + deterministic generated artifacts are one coherent candidate.
5. Commit the complete candidate.
6. Run `npm run galok:preflight`.
7. Only after preflight passes, push the branch.
8. Open/update a PR to main.
9. Inspect the actual GitHub checks. If red, diagnose the first real failed gate and fix the root cause; do not blindly rerun.
10. Do not merge until required validation is green.

At the end report:
- branch
- commit SHA
- PR URL/number
- source files changed
- generated artifacts changed
- local prepare/preflight result
- GitHub Actions result
- any remaining known risk

Now implement this request:
[PASTE TASK HERE]
```

## B. CI / red-Action repair

```text
Diagnose and repair the current Galok CI failure.

First read:
- AGENTS.md
- docs/engineering/CI_STANDARD.md
- docs/engineering/FAILURE_PLAYBOOK.md
- docs/engineering/FAILURE_PREVENTION_MATRIX.md

Do not assume the final red aggregator is the root cause.

Required method:
1. Identify the exact branch/PR/head SHA.
2. Identify the first red stage: local prepare, preflight, push, workflow admission, fast CI, runtime CI, deployment, production verification, or platform.
3. Read the exact failed step/log and classify it using the failure matrix.
4. Decide whether the failure is deterministic or transient.
5. For deterministic failures, do not rerun unchanged. Fix the root cause on the feature branch.
6. Never create a one-off workflow, weaken a validator, lower a threshold, discard generated diffs, or push main directly.
7. Run `npm run galok:prepare` if the fix can affect HTML/routes/metadata/discovery/observability.
8. Commit source + generated artifacts atomically.
9. Run `npm run galok:preflight`.
10. Push branch, then verify the new GitHub run.

Return a concise root-cause report:
- first failed stage
- exact failed gate
- historical fingerprint
- root cause
- files changed
- why the fix prevents recurrence
- new CI status
```

## C. Reading / typography development

```text
Work on Galok Reading under the canonical typography and release contract.

Read AGENTS.md, DEVELOPMENT_STANDARD.md, DISCOVERY_STANDARD.md, and TYPOGRAPHY_STANDARD.md before editing.

Typography rules:
- Preserve the active canonical Reading primary Chinese face.
- Preserve HanaMin/project-owned rare fallback.
- Preserve QIJIC only for its approved semantic display/book-title role.
- Never fail merely because the preferred face lacks a glyph if the canonical fallback resolves it.
- Never create per-entry fontfix files or supplement chains during routine content development.
- A full project-owned stack miss requires a dedicated typography-maintenance change.

Release sequence:
source edit → `npm run galok:prepare` → review generated diff → atomic commit → `npm run galok:preflight` → branch push → PR → green CI.

Task:
[PASTE READING TASK HERE]
```

## D. Engineering-governance change

```text
This task changes Galok's engineering governance.

Read all files under docs/engineering/ plus AGENTS.md before editing.

A governance change must:
- explain which historical failure class it addresses
- implement machine enforcement when feasible
- keep normal feature development off main
- keep workflows stable and small
- avoid duplicate validators/workflows
- update documentation and automation together
- preserve a clear rollback path

After implementation run the canonical prepare/preflight flow and verify the PR's GitHub Actions.
```
