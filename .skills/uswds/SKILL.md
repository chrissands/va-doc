---
name: USWDS
description: Consolidated repository documentation and guidance for using the USWDS + EDS codebase. Use this skill for migrations, upgrades, imports, and development tasks that must prioritize existing USWDS components and styles.
---

# USWDS + EDS Repository Skill

This skill is the single authoritative reference for working in this repository.
It consolidates the repository-wide migration guidance, build conventions, workflow expectations, and major documentation links.

## Purpose
- Provide coding agents and engineers with a consistent guide for USWDS + EDS development.
- Enforce the repository rule: use existing USWDS components and styles first.
- Discourage creation of new blocks or custom styles unless absolutely required.
- Point to the correct documentation, build scripts, and import workflows.

## Core Principles
- Prefer existing USWDS blocks and styles over creating new code.
- Avoid new blocks until all existing components have been evaluated.
- Use Content Driven Development for any block or decorator changes.
- Keep generated CSS/JS under source control and use the build scripts to regenerate.
- Follow EDS conventions for block structure, protected files, and custom overrides.

## When to Use This Skill
- Migrating pages into this codebase.
- Upgrading USWDS components or styles.
- Running build or import workflows.
- Reviewing repository conventions before making changes.

## Key Repository Documents
- `USWDS-INTEGRATION-PLAN.md` — overall project architecture and goals
- `QUICK-START.md` — setup, build, and development workflow
- `USWDS-UPDATE-STRATEGY.md` — update strategy, protected files, and override handling
- `LINTING-STRATEGY.md` / `LINTING-COMPLETE.md` — linting expectations and quality gates
- `CONTRIBUTING.md` — contribution process and local conventions
- `ARCHITECTURE-DECISIONS.md` — design decisions and project rationale
- `BUILD-STATUS.md` — current build health and status notes
- `USWDS-EDS-PATTERN.md` — USWDS/E DS implementation pattern guidance
- `DESIGN-TOKENS.md` / `TYPOGRAPHY.md` — style system decisions
- `AGENTS.md` — skill registration and discovery instructions

## Key Skill Documents
- `.skills/page-import/SKILL.md` — page migration orchestrator
- `.skills/content-driven-development/SKILL.md` — mandatory content-first development process
- `.skills/block-inventory/SKILL.md` — inventory available blocks before import or development
- `.skills/preview-import/SKILL.md` — local preview verification of imported page HTML
- `.skills/generate-import-html/SKILL.md` — generate structured authoring HTML
- `.skills/scrape-webpage/SKILL.md` — webpage scraping and content extraction
- `.skills/authoring-analysis/SKILL.md` — authoring decisions for content vs block use
- `.skills/block-collection-and-party/SKILL.md` — block lookup and compatibility checks
- `.skills/testing-blocks/SKILL.md` — validation and testing guidance

## Build & Upgrade Summary
### Build USWDS Components
- Install dependencies: `npm install`
- Build generated USWDS blocks: `npm run build:uswds`
- Output includes:
  - `blocks/[component]/[component].css`
  - `blocks/[component]/[component].js`
  - `styles/uswds-core.css`
  - font, icon, and asset files under `fonts/` and `icons/`

### Upgrade USWDS
- Update the package: `npm update @uswds/uswds`
- Rebuild: `npm run build:uswds`
- Follow `USWDS-UPDATE-STRATEGY.md` when protected files or custom overrides exist.
- Use `--force` only when you intend to overwrite generated files and then restore custom overrides.

## Migration Guidance
### Primary Rule
- Always try very hard not to create new blocks and styles.
- Prefer mapping source content to existing USWDS components and the code in this repository.
- Only create a new block or style when the content cannot be reasonably represented by existing components.

### Import Workflow
1. `scrape-webpage` — collect page HTML, metadata, and assets.
2. `identify-page-structure` — segment the page and identify content sequences.
3. `authoring-analysis` — decide default content vs existing block usage.
4. `generate-import-html` — produce structured HTML for authoring.
5. `preview-import` — verify the output in the local development environment.

### Import Philosophy
- Prefer default authoring content (`usa-prose`) whenever authors can enter text directly.
- Map repeating structures to existing blocks (e.g., cards, hero, accordion, tabs, table).
- Use existing decoration and block metadata models rather than inventing new patterns.
- Fetch block structures from the block collection before HTML generation to match decorator expectations.

### Block Selection Rules
- Check block availability with `.skills/block-collection-and-party/SKILL.md`.
- Use `.skills/block-inventory/SKILL.md` to compare source content against existing blocks.
- If a block exists, use it even if it requires minor content reformatting.
- If no block exists, ask whether an existing USWDS component can be adapted before creating new code.

## Protected Files and Custom Overrides
- Custom overrides in generated CSS files belong at the top of the file.
- Regenerate generated CSS/JS with care: custom overrides must be preserved.
- For updates to protected files, follow `USWDS-UPDATE-STRATEGY.md`.
- Do not overwrite custom EDS overrides without review.

## Validation Checklist
- `npm run lint` passes
- Imported page renders correctly in preview
- Layout matches source page structure
- No console or accessibility errors in preview
- Use existing blocks rather than new component development where possible

## Notes for Agents
- Read this skill first, then relevant `.skills/*` skills.
- If in doubt, ask: “Can this content be mapped to an existing USWDS component or block?”
- Use Content Driven Development for any code changes.
- Preserve repository conventions and reuse existing assets, styles, and blocks.

## Useful Repo Paths
- `blocks/` — USWDS component blocks
- `styles/` — global and USWDS core styles
- `fonts/` — USWDS font assets
- `icons/` — USWDS icon assets
- `scripts/build-uswds.js` — build orchestration
- `.skills/` — skill definitions for import, testing, and development workflows
- `.claude/skills/` — agent-facing skill definitions

## Reminder
This repo is designed to reuse existing USWDS components and EDS patterns. The highest-value outcome is a migration or enhancement that works with the codebase as-is, not one that rebuilds or replaces it.
