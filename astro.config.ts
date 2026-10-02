import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// Moving to a custom domain: set `site` to the domain, delete `base`,
// add public/CNAME, and update the base path in playwright.config.ts.
export default defineConfig({
  site: "https://jonborchardt.github.io",
  base: "/kai-portfolio",
  trailingSlash: "always",
  vite: {
    plugins: [tailwindcss()],
  },
});
