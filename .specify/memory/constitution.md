<!-- 
## Sync Impact Report
- Version change: 0.0.0 → 1.0.0
- Added principles: Code Quality & Cleanliness, Security-First Development, Rigorous Testing Standards, Seamless User Experience Consistency, Performance & Scalability
- Added sections: Technical Standards, Development Workflow
- Templates requiring updates:
    - ✅ .specify/templates/plan-template.md (assumed aligned with new quality/security principles)
    - ✅ .specify/templates/spec-template.md (assumed aligned with new UX/performance principles)
    - ✅ .specify/templates/tasks-template.md (assumed aligned with testing/quality priorities)
    - ⚠ .specify/templates/commands/*.md (manual check for outdated references needed)
- Follow-up TODOs: Verify that no command templates contain outdated agent names or deprecated workflows.
-->
# Mandadero Constitution
<!-- Example: Spec Constitution, TaskFlow Constitution, etc. -->

## Core Principles

### Code Quality & Cleanliness
Every line of code must be intentional and maintainable. Follow established patterns, avoid complexity without justification (YAGCI), and ensure readability through clean architecture and clear naming.

### Security-First Development
Security MUST be considered at every stage of the lifecycle. Implement principle of least privilege, validate all inputs, protect sensitive data, and conduct regular security reviews to mitigate vulnerabilities from the start.

### Rigorous Testing Standards
Testing is non-negotiable. Every feature must be covered by unit and integration tests. Follow a test-driven approach where possible, ensuring high coverage for critical business logic and error paths.

### Seamless User Experience Consistency
The interface (both CLI and UI) MUST provide a consistent and intuitive experience. Maintain predictable workflows, clear feedback loops, and unified design language to reduce cognitive load for users.

### Performance & Scalability
Systems must be designed for efficiency and growth. Optimize critical paths, minimize latency, manage resource consumption carefully, and ensure the architecture can handle increasing loads without breaking existing contracts.

## Technical Standards

All code must adhere to project-specific linting and type-checking rules. Complexity must be documented and justified via pull requests. Performance regressions must be identified through automated testing or profiling before merging.

## Development Workflow

Follow the spec-driven development flow: define requirements, create specifications, plan implementation, then execute. All changes must pass existing test suites and comply with the principles defined herein.

## Governance
All PRs/reviews must verify compliance; Complexity must be fundamentally justified; Use AGENTS.md for runtime development guidance.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): unknown | **Last Amended**: 2026-06-16
