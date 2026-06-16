<!--
SYNC IMPACT REPORT
==================
Version change: (uninitialized template) → 1.0.0
Bump rationale: Initial ratification of the project constitution (MAJOR baseline).

Principles (all newly defined):
  - I. Test-First (NON-NEGOTIABLE)        [explicitly selected]
  - II. Professional Output Quality        [derived from product intent]
  - III. User Data Ownership & Privacy     [derived from "create and share" + hosting]
  - IV. Accessible & Responsive Sharing    [derived from public, shareable CVs]
  - V. Simplicity First (YAGNI)            [derived best practice]

Added sections:
  - Core Principles (5)
  - Platform & Security Standards
  - Development Workflow & Quality Gates
  - Governance

Removed sections: none (initial creation)

Templates reviewed:
  - .specify/templates/plan-template.md   ✅ aligned (generic Constitution Check gate; no edits needed)
  - .specify/templates/spec-template.md   ✅ aligned (no principle-specific references)
  - .specify/templates/tasks-template.md  ✅ updated (tests changed from OPTIONAL → REQUIRED per Principle I)

Follow-up TODOs:
  - Confirm derived principles II–V reflect CVivo's intent; amend if needed.
  - Technology stack is not yet defined (no plan.md); revisit Platform Standards once chosen.
-->

# CVivo Constitution

CVivo is a hosted platform that lets anyone create, host, and share a great, professional CV.

## Core Principles

### I. Test-First (NON-NEGOTIABLE)

TDD is mandatory for all production code. Tests MUST be written and reviewed before
implementation, MUST fail first, and only then is implementation written to make them pass.
The Red-Green-Refactor cycle is strictly enforced. No feature, bug fix, or refactor merges
without accompanying tests that exercise its behavior.

Rationale: A CV platform is trusted with users' professional identities; correctness is not
optional, and test-first design is the most reliable guard against regressions in shared,
publicly visible output.

### II. Professional Output Quality

Every CV the platform produces — on screen, when shared, and on export (e.g. PDF) — MUST be
polished and professional. Rendering MUST be visually consistent across the supported output
targets, free of layout breakage, and faithful to the user's content. Output regressions
(broken pagination, clipped text, missing fields, font/spacing defects) are treated as
release-blocking defects.

Rationale: The product's core promise is that a user's CV looks great and professional; any
defect in output directly damages the user it represents.

### III. User Data Ownership & Privacy

Users own their CV data. The platform MUST allow users to view, edit, export, and delete their
data. Personal data MUST be protected in transit and at rest, and access MUST be limited to
what a feature genuinely requires. A CV is private by default; it becomes shareable or public
ONLY through an explicit, revocable user action.

Rationale: CVs contain sensitive personal information; user trust depends on clear ownership,
explicit sharing, and strong protection of that data.

### IV. Accessible & Responsive Sharing

Public and shared CV views MUST meet WCAG 2.1 AA accessibility requirements and MUST render
correctly across common screen sizes (mobile, tablet, desktop). Shareable links MUST behave
predictably (stable URLs, correct access scope) and degrade gracefully.

Rationale: A shared CV may be opened by anyone, on any device, including users relying on
assistive technology; it must be reachable and usable by all of them.

### V. Simplicity First (YAGNI)

Start with the simplest solution that satisfies the requirement. Speculative abstraction,
unused configuration, and premature optimization are prohibited. Any added complexity MUST be
justified against a concrete, present need and recorded where the decision is made.

Rationale: Simplicity keeps the platform maintainable and lowers the risk surface for the
quality and privacy guarantees above.

## Platform & Security Standards

- Personal data MUST be encrypted in transit (TLS) and protected at rest per the chosen
  hosting provider's standard mechanisms.
- Authentication and authorization MUST gate every operation that reads or mutates a user's
  private CV data.
- Sharing scope (private / link-accessible / public) MUST be explicit, auditable, and revocable
  by the owning user at any time.
- Output rendering (web view and export) MUST be covered by automated checks that detect
  visual or structural regressions before release.
- Third-party dependencies that handle personal data MUST be reviewed before adoption.

> Technology stack is defined per-feature in the relevant `plan.md`; these standards apply
> regardless of the stack chosen.

## Development Workflow & Quality Gates

- All changes are delivered via reviewed pull requests; no direct commits to the main branch.
- A change MUST NOT merge unless: (a) tests for the change exist and pass (Principle I),
  (b) output-quality checks pass for any change affecting CV rendering (Principle II), and
  (c) privacy/access scope is unchanged or explicitly reviewed (Principle III).
- Feature planning MUST pass the Constitution Check gate in `plan-template.md` before design
  proceeds, and re-check after design.
- Complexity introduced in a change MUST be justified in the PR description (Principle V).

## Governance

This constitution supersedes other development practices where they conflict. Amendments MUST
be proposed via pull request, documented in the Sync Impact Report at the top of this file, and
approved before merge. Dependent templates (`plan-template.md`, `spec-template.md`,
`tasks-template.md`) MUST be updated in the same change when an amendment affects them.

Versioning follows semantic versioning:
- MAJOR: backward-incompatible removal or redefinition of a principle or governance rule.
- MINOR: a new principle/section or materially expanded guidance.
- PATCH: clarifications and wording fixes with no semantic change.

All PRs and reviews MUST verify compliance with these principles. Unjustified complexity MUST
be rejected. Agents and contributors consult the active `plan.md` for runtime development
guidance.

**Version**: 1.0.0 | **Ratified**: 2026-06-16 | **Last Amended**: 2026-06-16
