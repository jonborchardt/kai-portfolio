import { satteri } from "@astrojs/markdown-satteri";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// Moving to a custom domain: set `site` to the domain, set `base` to "",
// add public/CNAME, and update the base path in playwright.config.ts.
const base = "/kai-portfolio";

export default defineConfig({
  site: "https://jonborchardt.github.io",
  base,
  trailingSlash: "always",
  markdown: {
    processor: satteri({
      hastPlugins: [
        {
          // A link written in Markdown as /about/ gets the base path, the way
          // href() adds it to links in pages.
          name: "base-path-links",
          element: {
            filter: ["a"],
            visit(node, ctx) {
              const url = node.properties.href;
              if (typeof url === "string" && /^\/(?!\/)/.test(url)) {
                ctx.setProperty(node, "href", base + url);
              }
            },
          },
        },
      ],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
