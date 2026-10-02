import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import astro from "eslint-plugin-astro";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores([
    "dist/",
    ".astro/",
    "content/",
    "docs/",
    "public/design-options/",
    "playwright-report/",
    "test-results/",
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,
  prettier,
);
