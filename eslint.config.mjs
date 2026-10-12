import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // RULE NOANY1 (hard): `any` is banned everywhere — build-breaking error, never a warning.
  // No `// eslint-disable` escape hatches, no `as any` casts. Always use a real type
  // (interface, generic, `unknown` + narrowing, or an imported type). See
  // docs/agent-rules/32-no-any-type-safety.md.
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
]);

export default eslintConfig;
