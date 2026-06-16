# Feature Specification: CVivo CV Builder & Sharing Platform

**Feature Branch**: `001-cvivo-cv-platform`

**Created**: 2026-06-16

**Status**: Draft

**Input**: User description: "CVivo CV builder and sharing platform"

## Clarifications

### Session 2026-06-16

- Q: What should a shared CV link look like (token vs. vanity slug)? → A: User-chosen vanity
  slug (e.g., `cvivo.com/jane-doe`), drawn from a globally unique namespace with validation.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Build a professional CV (Priority: P1)

A job seeker signs up for CVivo, enters their professional details (contact information,
work experience, education, skills, and a summary), chooses a professional template, and
sees their CV rendered in a polished, professional layout that updates as they edit. They
can save their work and return to it later.

**Why this priority**: The core promise of CVivo is helping anyone produce a great,
professional CV. Without the ability to create and edit a well-presented CV, the platform
delivers no value. This is the minimum viable product.

**Independent Test**: Can be fully tested by creating an account, entering CV content across
all standard sections, selecting a template, and confirming the rendered CV is complete,
accurate, and professionally formatted — without relying on sharing or export.

**Acceptance Scenarios**:

1. **Given** a new visitor, **When** they sign up and start a new CV, **Then** they are
   presented with an editor containing standard CV sections to fill in.
2. **Given** a user editing their CV, **When** they enter or change content in a section,
   **Then** the rendered preview reflects the change accurately and remains professionally
   formatted.
3. **Given** a user with an in-progress CV, **When** they save and later return,
   **Then** all previously entered content is preserved exactly.
4. **Given** a user, **When** they switch to a different professional template,
   **Then** their content is preserved and re-rendered in the new template without loss.

---

### User Story 2 - Share a CV via a link (Priority: P2)

A user who has built a CV generates a shareable link and sends it to a recruiter. The
recruiter opens the link on their phone or laptop and sees a clean, professional, accessible
version of the CV without needing a CVivo account. The user can later revoke the link so it
no longer works.

**Why this priority**: Sharing is the second half of CVivo's promise ("create and share").
It depends on a CV existing (US1) but adds the distribution value that differentiates a
hosted platform from a local document editor.

**Independent Test**: Can be tested by taking an existing CV, generating a share link,
opening it in a separate unauthenticated session on multiple screen sizes, and then revoking
the link and confirming it no longer grants access.

**Acceptance Scenarios**:

1. **Given** a CV that is private by default, **When** the owner enables sharing,
   **Then** the system produces a stable, accessible public link to a read-only view of the CV.
2. **Given** a shared CV link, **When** an unauthenticated visitor opens it on a phone, tablet,
   or desktop, **Then** the CV renders correctly and remains readable on each screen size.
3. **Given** a previously shared CV, **When** the owner revokes the link,
   **Then** subsequent visits to that link no longer display the CV.
4. **Given** a CV that has not been shared, **When** anyone other than the owner attempts to
   view it, **Then** access is denied.

---

### User Story 3 - Export a CV as a document (Priority: P3)

A user wants a file to attach to an application portal, so they export their CV as a PDF that
matches what they see on screen and is suitable for printing and submitting.

**Why this priority**: Many applications still require an uploaded document. Export increases
the CV's usefulness but is not required to demonstrate the core create-and-share value.

**Independent Test**: Can be tested by exporting an existing CV and confirming the produced
file visually matches the on-screen CV, paginates cleanly, and contains all content.

**Acceptance Scenarios**:

1. **Given** a completed CV, **When** the user exports it,
   **Then** they receive a document that faithfully reproduces the on-screen layout and content.
2. **Given** a CV that spans more than one page, **When** it is exported,
   **Then** content is paginated cleanly with no clipped or overlapping text.

---

### Edge Cases

- What happens when a user saves a CV with one or more sections left empty? (Empty optional
  sections are omitted from the rendered CV rather than shown as blank headings.)
- How does the system handle very long entries (e.g., a job description of several hundred
  words) so the layout does not break?
- What happens when a user requests a vanity slug that is already taken or improperly formatted?
- What happens when a visitor opens a share link that has been revoked or never existed?
- What happens to a revoked slug — can the same owner or a different user reuse it later?
- How does the system handle a user attempting to access or edit a CV that is not theirs?
- What happens when two browser tabs edit the same CV concurrently?
- How does the rendered CV handle special characters, non-Latin scripts, and right-to-left text?
- What happens when a user deletes their account — are their shared links and data removed?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow a visitor to create an account and sign in to access their CVs.
- **FR-002**: System MUST allow an authenticated user to create, edit, save, and delete CVs.
- **FR-003**: System MUST provide standard CV sections — at minimum contact details, professional
  summary, work experience, education, and skills — for the user to populate.
- **FR-004**: System MUST render a live, professionally formatted preview of the CV that reflects
  the user's content as it is edited.
- **FR-005**: System MUST offer a selection of professional templates and allow the user to switch
  templates without losing entered content.
- **FR-006**: System MUST persist CV content reliably so that saved CVs are restored exactly on
  the user's return.
- **FR-007**: System MUST treat every CV as private by default, accessible only to its owner.
- **FR-008**: Users MUST be able to publish a CV at a read-only public link through an explicit
  action, choosing a vanity slug (e.g., `cvivo.com/jane-doe`) that the system validates and
  reserves from a globally unique namespace.
- **FR-008a**: System MUST reject a vanity slug that is already in use or violates slug formatting
  rules, and MUST clearly inform the user so they can choose another.
- **FR-009**: Users MUST be able to revoke a previously generated share link at any time, after
  which the link no longer grants access.
- **FR-010**: System MUST render shared CVs correctly and legibly across mobile, tablet, and
  desktop screen sizes.
- **FR-011**: Shared CV views MUST meet WCAG 2.1 AA accessibility requirements.
- **FR-012**: Users MUST be able to export a CV as a document (PDF) that faithfully reproduces the
  on-screen layout and content, including clean pagination.
- **FR-013**: System MUST prevent any user from viewing or modifying CVs they do not own and are
  not shared with them.
- **FR-014**: Users MUST be able to view, export, and permanently delete their personal data,
  including all CVs and active share links.
- **FR-015**: System MUST omit empty optional sections from the rendered and exported CV rather
  than displaying blank headings.
- **FR-016**: System MUST provide clear, user-friendly feedback when a visited share link is
  invalid, revoked, or never existed.

### Key Entities *(include if feature involves data)*

- **User Account**: A registered person who owns CVs; key attributes include identity/credentials,
  contact email, and ownership of one or more CVs and share links.
- **CV**: A user's curriculum vitae; key attributes include title, ordered sections of content,
  selected template, visibility state (private/shared), and timestamps. Belongs to one User Account.
- **CV Section**: A typed block of content within a CV (e.g., experience entry, education entry,
  skill list, summary); ordered and editable.
- **Template**: A professional visual design that determines how CV content is laid out and styled;
  selectable per CV and interchangeable without content loss.
- **Share Link**: A revocable reference that grants unauthenticated, read-only access to one CV via
  a user-chosen vanity slug; key attributes include the slug (globally unique across the platform),
  its access state (active/revoked), and the CV it points to. Revoking the link frees its slug from
  active use.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user can create an account and produce a complete, professional-looking
  CV in under 15 minutes.
- **SC-002**: At least 90% of users who start a CV complete all core sections (contact, experience,
  education, skills) and reach a shareable state on their first session.
- **SC-003**: A shared CV link opens and renders correctly for an unauthenticated visitor on the
  first attempt across mobile, tablet, and desktop, with no broken layout, in at least 99% of views.
- **SC-004**: Exported CVs are judged a faithful match to the on-screen version (correct content,
  no clipped text, clean pagination) in at least 99% of exports.
- **SC-005**: Shared CV pages pass an automated WCAG 2.1 AA accessibility audit with zero critical
  violations.
- **SC-006**: A shared CV page becomes viewable to a visitor within 3 seconds of opening the link on
  a typical broadband connection.
- **SC-007**: Revoking a share link blocks access for all subsequent visitors immediately (within
  one page load).
- **SC-008**: 100% of account-deletion requests result in the removal of the user's CVs and the
  deactivation of all their share links.

## Assumptions

- The platform is web-based and accessed through a modern browser; a dedicated native mobile app is
  out of scope for v1 (responsive web covers mobile use).
- CVivo is offered free of charge for v1; pricing tiers and paid features are out of scope.
- Authentication uses standard email/password sign-up with the option for common third-party sign-in
  (e.g., OAuth); the exact providers are an implementation detail.
- Shared CVs are accessible only via their link and are not listed in any public, searchable
  directory in v1.
- A curated set of professional templates is provided by CVivo; user-authored custom templates are
  out of scope for v1.
- Document export targets PDF as the export format for v1; other formats (e.g., Word) are out of scope.
- Real-time multi-user collaborative editing of a single CV is out of scope for v1.
- Standard data-protection practices apply to personal data, consistent with the project constitution's
  privacy principle.
