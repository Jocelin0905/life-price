# Life Price V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first local-only web app that converts prices to work time and preserves skipped-purchase snapshots.

**Architecture:** A React and TypeScript single-page application separates pure domain calculations, local-month aggregation, resilient storage, and UI state. All formulas live in `calculations.ts`; all browser persistence lives in `lifePriceStorage.ts`, which enters protected in-memory mode on read failures without overwriting the original value.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, CSS, localStorage

---

## File map

- `src/domain/types.ts`: settings, result, history, storage and error types.
- `src/domain/calculations.ts`: the sole entry point for income, time, usage-cost and monthly-summary calculations.
- `src/domain/formatting.ts`: currency, time and local-month labels.
- `src/domain/validation.ts`: numeric input validation.
- `src/storage/lifePriceStorage.ts`: guarded localStorage access with memory fallback.
- `src/hooks/useLifePriceStore.ts`: React adapter for settings and history mutations.
- `src/pages/*.tsx`: onboarding, calculator, history and settings views.
- `src/components/*.tsx`: focused input, result, navigation, history and dialog UI.
- `src/styles/global.css`: design tokens and responsive styling.
- `src/**/*.test.ts(x)`: domain, storage and UI behavior tests.

### Task 1: Project foundation and test runner

- [ ] Initialize the locked Sites React starter in the empty workspace.
- [ ] Inspect and retain its hosting, build and dependency conventions.
- [ ] Configure Vitest with jsdom and Testing Library.
- [ ] Run the empty test suite and production build to establish the baseline.

### Task 2: Domain calculations through TDD

- [ ] Write failing tests for hourly income, 699 price conversion, sub-hour formatting inputs, usage cost and invalid numeric inputs.
- [ ] Run the focused tests and confirm they fail because the APIs do not exist.
- [ ] Implement types, calculations, validation and formatting with formulas in `calculations.ts` only.
- [ ] Run the focused tests, then the full suite.

Expected example assertions:

```ts
expect(calculateHourlyIncome({ monthlyIncome: 8000, workDaysPerWeek: 5, workHoursPerDay: 8 }))
  .toBeCloseTo(46.153846, 5);
expect(calculatePriceResult(699, settings).workMinutes).toBe(909);
expect(formatWorkMinutes(909)).toBe("15小时09分钟");
```

### Task 3: Local-month history aggregation through TDD

- [ ] Write failing tests using timestamps that cross a UTC month boundary but remain in the same mocked local month.
- [ ] Confirm the tests fail with a missing local-month grouping API.
- [ ] Implement local date keys using `getFullYear()` and `getMonth()` and aggregate price, minutes and snapshot workdays.
- [ ] Verify focused and full tests pass.

### Task 4: Protected localStorage adapter through TDD

- [ ] Write failing tests for valid load/save, damaged JSON, unknown schema, denied access, delete, and clear.
- [ ] Assert damaged or unknown data is never replaced by a blank store.
- [ ] Implement a result-based adapter returning data, persistence status and a user-facing warning.
- [ ] Keep an in-memory session store after read failure and disable writes to the damaged persistent key.
- [ ] Verify focused and full tests pass.

### Task 5: Onboarding and application shell through TDD

- [ ] Write failing UI tests for first-run onboarding, validation, live hourly preview and successful transition.
- [ ] Implement the app shell, status banner, accessible fields and bottom navigation.
- [ ] Implement onboarding using domain validation and calculation APIs.
- [ ] Verify UI and full tests pass.

### Task 6: Calculator flow through TDD

- [ ] Write failing UI tests for disabled empty state, 699 result, optional name, skipped usage cost, valid usage cost, and both decisions.
- [ ] Implement price entry and make work time the dominant result element.
- [ ] Implement optional usage-cost calculation without blocking decisions.
- [ ] Save a snapshot only for “算了”; show feedback for both decisions and allow reset.
- [ ] Verify UI and full tests pass.

### Task 7: History and settings through TDD

- [ ] Write failing UI tests for local-month summaries, reverse ordering, empty months, detail omission rules, deletion, setting changes, and clearing all data.
- [ ] Implement month selection, summaries, history list, accessible detail dialog and delete confirmation.
- [ ] Implement settings editing with live hourly preview and immutable history snapshots.
- [ ] Implement clear-all confirmation and return to onboarding.
- [ ] Verify UI and full tests pass.

### Task 8: Responsive visual system and accessibility

- [ ] Apply the warm light theme, single accent, typographic hierarchy and mobile safe-area layout.
- [ ] Add motivated state transitions with reduced-motion fallbacks.
- [ ] Test 320px mobile, common phone, tablet and desktop widths for overflow.
- [ ] Check keyboard navigation, focus visibility, labels, dialogs and color contrast.

### Task 9: Final verification and browser walkthrough

- [ ] Run the full test suite with zero failures.
- [ ] Run TypeScript and lint checks with zero errors.
- [ ] Run the production build and confirm exit code 0.
- [ ] Start the local preview and exercise onboarding, calculation, usage cost, both decisions, history details, deletion, settings changes and clear-all.
- [ ] Verify the protected-storage warning path without overwriting the damaged key.
- [ ] Review the implementation line by line against the design acceptance criteria and record any non-V1 ideas without implementing them.
