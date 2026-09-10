# Life Price Vercel Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the existing Life Price V1 as an unchanged public static site on Vercel.

**Architecture:** Keep the React 19 and Next.js App Router application unchanged, add an isolated Next.js static-export build path, and let Vercel serve the generated `out/` directory from its CDN. The existing vinext/Sites development path and the current Sites deployment remain available until the Vercel URL passes verification.

**Tech Stack:** React 19, Next.js 16, TypeScript, Vitest, pnpm, Vercel static hosting

---

## File Structure

- Modify `next.config.ts`: enable Next.js static export without changing runtime application behavior.
- Modify `package.json`: add explicit Vercel build and artifact-verification commands while preserving the current preview command.
- Create `vercel.json`: declare the Vercel build command and `out/` publish directory.
- Create `src/deployment/vercel-config.test.ts`: verify the static-export contract as an automated test.
- Create `scripts/verify-static-export.mjs`: fail deployment preparation unless the required static entry and asset directory exist.

### Task 1: Lock the Vercel Static-Export Contract

**Files:**
- Create: `src/deployment/vercel-config.test.ts`
- Modify: `next.config.ts`
- Modify: `package.json`
- Create: `vercel.json`

- [ ] **Step 1: Write the failing deployment configuration test**

```ts
import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";
import packageJson from "../../package.json";
import vercelConfig from "../../vercel.json";

describe("Vercel static deployment configuration", () => {
  it("exports a static Next.js site into out", () => {
    expect(nextConfig.output).toBe("export");
    expect(packageJson.scripts["build:vercel"]).toBe("next build");
    expect(packageJson.scripts["verify:static"]).toBe(
      "node scripts/verify-static-export.mjs",
    );
    expect(packageJson.scripts.lint).toContain("--ignore-pattern out");
    expect(vercelConfig).toEqual({
      buildCommand: "pnpm run build:vercel",
      outputDirectory: "out",
    });
  });
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `.\\node_modules\\.bin\\vitest.CMD run src/deployment/vercel-config.test.ts`

Expected: FAIL because `vercel.json` and the Vercel scripts do not exist.

- [ ] **Step 3: Enable static export**

Replace the config body in `next.config.ts` with:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
```

- [ ] **Step 4: Add isolated Vercel scripts**

Add these entries under `scripts` in `package.json` without changing `dev`, `build`, `start`, `test`, or `typecheck`:

```json
"build:vercel": "next build",
"verify:static": "node scripts/verify-static-export.mjs"
```

Extend the existing lint command so generated static files are excluded:

```json
"lint": "eslint . --ignore-pattern dist --ignore-pattern .next --ignore-pattern out --ignore-pattern work"
```

- [ ] **Step 5: Add the Vercel deployment declaration**

Create `vercel.json`:

```json
{
  "buildCommand": "pnpm run build:vercel",
  "outputDirectory": "out"
}
```

- [ ] **Step 6: Run the focused configuration test**

Run: `.\\node_modules\\.bin\\vitest.CMD run src/deployment/vercel-config.test.ts`

Expected: PASS with one test.

- [ ] **Step 7: Commit the deployment contract**

```text
git add next.config.ts package.json vercel.json src/deployment/vercel-config.test.ts
git commit -m "build: add Vercel static export target"
```

### Task 2: Verify the Generated Static Artifact

**Files:**
- Create: `scripts/verify-static-export.mjs`

- [ ] **Step 1: Create the artifact verifier**

```js
import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve } from "node:path";

const requiredPaths = ["out/index.html", "out/_next"];

for (const relativePath of requiredPaths) {
  try {
    await access(resolve(relativePath), constants.R_OK);
  } catch {
    console.error(`Missing static export artifact: ${relativePath}`);
    process.exit(1);
  }
}

console.log("Static export artifact verified.");
```

- [ ] **Step 2: Run the verifier before building**

Run: `node scripts/verify-static-export.mjs`

Expected: FAIL with `Missing static export artifact: out/index.html` when no current export exists.

- [ ] **Step 3: Build the Vercel artifact**

Run: `.\\node_modules\\.bin\\next.CMD build`

Expected: exit 0 and create `out/index.html` plus `out/_next/`.

- [ ] **Step 4: Verify the artifact**

Run: `node scripts/verify-static-export.mjs`

Expected: `Static export artifact verified.`

- [ ] **Step 5: Serve the artifact locally and smoke-test it**

Run: `pnpm dlx serve@14.2.5 out --listen 4173`

In a second terminal run: `curl.exe -I http://127.0.0.1:4173/`

Expected: the request returns HTTP 200 and the browser displays the Life Price onboarding or calculator according to that browser profile's localStorage state. Stop the temporary server after the check.

- [ ] **Step 6: Commit the artifact verifier**

```text
git add scripts/verify-static-export.mjs
git commit -m "test: verify Vercel static artifact"
```

### Task 3: Run Full Regression Verification

**Files:**
- Verify: `src/domain/*.test.ts`
- Verify: `src/storage/lifePriceStorage.test.ts`
- Verify: `src/components/life-price/life-price-app.test.tsx`
- Verify: `src/deployment/vercel-config.test.ts`

- [ ] **Step 1: Run all automated tests**

Run: `.\\node_modules\\.bin\\vitest.CMD run`

Expected: all existing 19 tests plus the new deployment configuration test pass.

- [ ] **Step 2: Run type checking**

Run: `.\\node_modules\\.bin\\tsc.CMD --noEmit`

Expected: exit 0 with no TypeScript errors.

- [ ] **Step 3: Run source linting**

Run: `.\\node_modules\\.bin\\eslint.CMD . --ignore-pattern dist --ignore-pattern .next --ignore-pattern out --ignore-pattern work`

Expected: exit 0 with no ESLint errors.

- [ ] **Step 4: Rebuild and re-verify the final artifact**

Run: `.\\node_modules\\.bin\\next.CMD build`

Run: `node scripts/verify-static-export.mjs`

Expected: both commands exit 0.

### Task 4: Authenticate and Publish to Vercel

**Files:**
- Vercel may create: `.vercel/project.json`
- Modify if needed: `.gitignore`

- [ ] **Step 1: Inform the user that Vercel authorization is now required**

Tell the user that all local preparation has passed and the next action opens Vercel's one-time login flow. Do not start production deployment before this notice.

- [ ] **Step 2: Start Vercel login and hand off the authentication step**

Run: `pnpm dlx vercel login`

Expected: Vercel opens or prints an official verification URL. The user completes authentication; no credential is copied into chat or committed to the repository.

- [ ] **Step 3: Confirm authentication without exposing credentials**

Run: `pnpm dlx vercel whoami`

Expected: exit 0 and display the authenticated Vercel account name.

- [ ] **Step 4: Add Vercel's local metadata directory to Git ignore if created**

Ensure `.gitignore` contains:

```gitignore
.vercel
```

- [ ] **Step 5: Publish the verified artifact publicly**

Run: `pnpm dlx vercel --prod --yes`

Expected: exit 0 and return a public HTTPS `vercel.app` production URL.

### Task 5: Verify the Public Vercel Deployment

**Files:**
- No source changes expected.

- [ ] **Step 1: Verify anonymous availability**

Request the production URL without Vercel credentials.

Expected: HTTP 200 with no login page, Cloudflare block page, or deployment protection interstitial.

- [ ] **Step 2: Run the mobile browser flow**

At a 390 × 844 viewport, complete onboarding with monthly income `8000`, five workdays, and eight hours per day; calculate `699`; verify `15小时09分钟` and `≈ 1.89 个工作日`; enter 20 uses; verify `¥34.95 / 次`; choose `算了`; confirm the saved history detail.

- [ ] **Step 3: Verify snapshot behavior**

Change monthly income to `10000`, return to history, and confirm the saved `699` record remains `15小时09分钟`.

- [ ] **Step 4: Verify browser quality signals**

Confirm viewport width equals document width, the browser console has no errors, and refreshing the Vercel URL preserves current-domain localStorage data.

- [ ] **Step 5: Preserve the original Site and hand off the new URL**

Do not delete or unpublish the existing `chatgpt.site` deployment. Open the verified Vercel URL for the user and report that the new domain starts with independent localStorage.
