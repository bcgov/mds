import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import { defineConfig, rspack } from "@rsbuild/core";
import { pluginLess } from "@rsbuild/plugin-less";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginSass } from "@rsbuild/plugin-sass";
import { pluginTypeCheck } from "@rsbuild/plugin-type-check";

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const { parsed = {} } = dotenv.config({ path: path.join(ROOT_DIR, ".env") });

const BUILD_DIR = process.env.BUILD_DIR || "build";

const PATHS = {
  src: path.join(ROOT_DIR, "src"),
  entry: path.join(ROOT_DIR, "src", "index.js"),
  public: path.join(ROOT_DIR, "public"),
  template: path.join(ROOT_DIR, "public", "index.html"),
  build: path.join(ROOT_DIR, BUILD_DIR),
  vendor: path.join(ROOT_DIR, "vendor"),
  commonPackage: path.join(ROOT_DIR, "common"),
  sharedPackage: path.join(ROOT_DIR, "..", "common", "src"),
};

const PATH_ALIASES = {
  "@": PATHS.src,
  vendor: PATHS.vendor,
  "@common": PATHS.commonPackage,
  "@mds/common": `${PATHS.sharedPackage}`,
};

const getEnvironmentDefinitions = () => {
  const environment = { BASE_PATH: "", ...process.env, ...parsed };

  return Object.fromEntries(
    Object.entries(environment).map(([key, value]) => [key, JSON.stringify(value)]),
  );
};

export default defineConfig(() => ({
  root: ROOT_DIR,
  plugins: [
    pluginReact({ swcReactOptions: { runtime: "classic" } }),
    pluginSass(),
    pluginLess({
      lessLoaderOptions: {
        lessOptions: {
          javascriptEnabled: true,
          modifyVars: {
            white: "#f1f1f2",
            blue: "#003366",
            "primary-color": "#5e46a1",
            "link-color": "#1DA57A",
            "success-color": "#45a766",
            "warning-color": "#f3cd65",
            "error-color": "#d40d0d",
            "background-color-light": "#f4f0f0",
            "item-hover-bg": "#f4f0f0",
            "table-selected-row-bg": "#f4f0f0",
            "font-size-base": "1rem",
            "font-size-lg": "1.125rem",
            "font-size-sm": "0.875rem",
            "font-family": '"Open Sans", sans-serif',
            "border-radius-base": "5px",
          },
        },
      },
    }),
    pluginTypeCheck(),
  ],
  source: {
    entry: {
      index: PATHS.entry,
    },
    include: [PATHS.commonPackage, PATHS.sharedPackage],
    assetsInclude: /\.(?:png|jpe?g|gif|svg|mp3|pdf|docx?|xlsx?|woff2?|ttf|eot)$/,
    define: {
      "process.env": getEnvironmentDefinitions(),
    },
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      ...PATH_ALIASES,
      // Use lodash-es that supports proper tree-shaking
      lodash: "lodash-es",
    },
  },
  html: {
    template: PATHS.template,
  },
  server: {
    host: process.env.HOST || "0.0.0.0",
    port: Number(process.env.PORT) || 3000,
    // Served at "/" in dev like webpack-dev-server; output.copy handles build output.
    publicDir: { copyOnBuild: false },
    historyApiFallback: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
    },
  },
  output: {
    assetPrefix: process.env.ASSET_PATH || "/",
    distPath: {
      root: PATHS.build,
    },
    copy: [
      { from: PATHS.public, to: "public" },
      { from: path.join(PATHS.public, "custom-script.js"), to: "custom-script.js" },
    ],
  },
  tools: {
    swc: {
      jsc: {
        parser: {
          syntax: "typescript",
          tsx: true,
        },
      },
    },
    rspack: {
      plugins: [
        new rspack.ProvidePlugin({
          REQUEST_HEADER: path.resolve(ROOT_DIR, "common/utils/RequestHeaders.tsx"),
          GLOBAL_ROUTES: path.resolve(ROOT_DIR, "src/constants/routes.ts"),
        }),
        new rspack.IgnorePlugin({
          resourceRegExp: /^\.\/locale$/,
          contextRegExp: /moment$/,
        }),
      ],
    },
  },
}));
