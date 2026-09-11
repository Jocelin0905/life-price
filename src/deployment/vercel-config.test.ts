import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";
import packageJson from "../../package.json";
import vercelConfig from "../../vercel.json";

describe("Vercel static deployment configuration", () => {
  it("exports a static Next.js site into out", () => {
    expect(nextConfig.output).toBe("export");
    expect(packageJson.scripts["build:vercel"]).toBe("next build");
    expect(packageJson.scripts["verify:static"]).toBe("node scripts/verify-static-export.mjs");
    expect(packageJson.scripts.lint).toContain("--ignore-pattern out");
    expect(vercelConfig).toEqual({
      buildCommand: "pnpm run build:vercel",
      outputDirectory: "out",
      framework: null,
    });
  });
});
