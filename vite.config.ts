import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";

import type { OutputBundle, OutputChunk } from "rollup";

// Must match SIZES in src/pages/HomePage.tsx
const HERO_SIZES = "(max-width: 767px) 100vw, 50vw";

// The code each route needs, as source files (mirrors START_CODE in
// src/routes/Index.tsx). The home page is in the main bundle already.
const ROUTE_SOURCES: Record<string, string[]> = {
  "/buy": ["pages/Buy/index.tsx", "pages/Buy/Home.tsx"],
  "/buy/cart": ["pages/Buy/index.tsx", "pages/Buy/Cart.tsx"],
  "/buy/track-bought": ["pages/Buy/index.tsx", "pages/Buy/TrackBought.tsx"],
  "/buy/sign-up": ["pages/Buy/index.tsx", "pages/SignUp.tsx"],
  "/sell": ["pages/Sell/index.tsx", "pages/Sell/Home.tsx"],
  "/sell/add-item": ["pages/Sell/index.tsx", "pages/Sell/AddItem.tsx"],
  "/sell/track-sold": ["pages/Sell/index.tsx", "pages/Sell/TrackSold.tsx"],
  "/sell/sign-up": ["pages/Sell/index.tsx", "pages/SignUp.tsx"],
};
// the first product's picture is the largest paint on the item grids
const FIRST_PRODUCT_IMAGE = /^assets\/headphones-[\w-]+\.webp$/;

// a chunk's file and every file it imports, so the page's code arrives in
// one round trip instead of one per level of imports
const withImports = (
  bundle: OutputBundle,
  fileName: string,
  seen: Set<string>,
) => {
  if (seen.has(fileName)) return;
  seen.add(fileName);
  const chunk = bundle[fileName] as OutputChunk | undefined;
  chunk?.imports.forEach((name) => withImports(bundle, name, seen));
};

// Every route shares index.html, and the browser only finds a page's code
// and pictures after the main JavaScript has run. This adds a small script
// to the built index.html that, for the page being opened, starts those
// downloads straight away: the home photos, or the page's code (and the
// first product picture on Buy and Sell). Build only: file names have hashes.
const preloadStartPage = (): Plugin => ({
  name: "preload-start-page",
  apply: "build",
  transformIndexHtml: {
    order: "post",
    handler(html, ctx) {
      const bundle = ctx.bundle;
      if (!bundle) return html;
      const files = Object.keys(bundle);
      const mainFiles = new Set<string>();
      Object.values(bundle).forEach((item) => {
        if (item.type === "chunk" && item.isEntry)
          withImports(bundle, item.fileName, mainFiles);
      });

      const srcset = (side: string) =>
        [640, 900, 1200]
          .map((width) => {
            const file = files.find((name) =>
              new RegExp(`^assets/${side}-${width}-[\\w-]+\\.avif$`).test(name),
            );
            return file && `/${file} ${width}w`;
          })
          .filter(Boolean)
          .join(", ");
      const heroSets = ["sell", "buy"].map(srcset).filter(Boolean);
      const productImage = files.find((name) => FIRST_PRODUCT_IMAGE.test(name));

      const routeCode: Record<string, string[]> = {};
      Object.entries(ROUTE_SOURCES).forEach(([path, sources]) => {
        const needed = new Set<string>();
        sources.forEach((source) => {
          const chunk = Object.values(bundle).find(
            (item) =>
              item.type === "chunk" &&
              item.facadeModuleId
                ?.replace(/\\/g, "/")
                .endsWith(`/src/${source}`),
          );
          if (chunk) withImports(bundle, chunk.fileName, needed);
        });
        // the main files are loaded by index.html already
        routeCode[path] = [...needed]
          .filter((file) => !mainFiles.has(file))
          .map((file) => `/${file}`);
      });

      const script = `(function () {
  var path = location.pathname.replace(/\\/+$/, "") || "/";
  function add(attrs) {
    var link = document.createElement("link");
    for (var key in attrs) link.setAttribute(key, attrs[key]);
    document.head.appendChild(link);
  }
  if (path === "/") ${JSON.stringify(heroSets)}.forEach(function (set) {
    add({ rel: "preload", as: "image", type: "image/avif", imagesrcset: set, imagesizes: ${JSON.stringify(HERO_SIZES)}, fetchpriority: "high" });
  });
  (${JSON.stringify(routeCode)}[path] || []).forEach(function (file) {
    add({ rel: "modulepreload", href: file, crossorigin: "" });
  });
  if (${JSON.stringify(productImage ? `/${productImage}` : "")} && (path === "/buy" || path === "/sell"))
    add({ rel: "preload", as: "image", href: ${JSON.stringify(productImage ? `/${productImage}` : "")}, fetchpriority: "high" });
})();`;
      // end of <head>: <meta charset> must come first; module scripts run later
      return [{ tag: "script", children: script, injectTo: "head" }];
    },
  },
});

// The app's own CSS file is under 1 kB (font faces and a reset), but as a
// <link> it blocks the first paint for a whole round trip. Small enough to
// put straight into index.html instead.
const INLINE_CSS_LIMIT = 4096;
const inlineSmallCss = (): Plugin => ({
  name: "inline-small-css",
  apply: "build",
  transformIndexHtml: {
    order: "post",
    handler(html, ctx) {
      return html.replace(
        /<link rel="stylesheet"[^>]*href="\/(assets\/[^"]+\.css)"[^>]*>/g,
        (tag, file: string) => {
          const asset = ctx.bundle?.[file];
          if (!asset || asset.type !== "asset") return tag;
          const css = String(asset.source);
          return css.length > INLINE_CSS_LIMIT ? tag : `<style>${css}</style>`;
        },
      );
    },
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), preloadStartPage(), inlineSmallCss()],
  build: {
    rollupOptions: {
      output: {
        // React, the router, Redux and Emotion in one file: every page needs
        // them and they change less often than the app, so browsers keep it
        // cached across deploys. MUI is left to Rollup, which splits it by
        // page (one MUI file would put dialogs and forms on the home page).
        manualChunks(id) {
          const vendor =
            /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom|@remix-run|react-redux|@reduxjs|redux|redux-thunk|immer|reselect|use-sync-external-store|@emotion)[\\/]/;
          if (vendor.test(id)) return "vendor";
        },
      },
    },
  },
});
