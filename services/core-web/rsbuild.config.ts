import path from "path";

import dotenv from "dotenv";
import { pluginSass } from '@rsbuild/plugin-sass';
import { pluginLess } from '@rsbuild/plugin-less';
import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rsbuild/core';
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';


dotenv.config({ path: `${__dirname}/.env` });

const BUILD_DIR = process.env.BUILD_DIR || "build";

const PATHS = {
  src: path.join(__dirname, "src"),
  entry: path.join(__dirname, "src", "index.js"),
  public: path.join(__dirname, "public"),
  template: path.join(__dirname, "public", "index.html"),
  build: path.join(__dirname, BUILD_DIR),
  node_modules: path.join(__dirname, "node_modules"),
  vendor: path.join(__dirname, "vendor"),
  commonPackage: path.join(__dirname, "common"),
  sharedPackage: path.join(__dirname, "..", "common", "src"),
};


const PATH_ALIASES = {
  "@": PATHS.src,
  vendor: PATHS.vendor,
  "@common": PATHS.commonPackage,
  "@mds/common": `${PATHS.sharedPackage}`,
  "@assets": path.join(__dirname, "src", "assets"),
};

const envFile: any = {};

if (process.env) {
  Object.keys(process.env).map((key) => {
    envFile[key] = JSON.stringify(process.env[key]);
  });
}
if (dotenv.parsed) {
  Object.keys(dotenv.parsed).map((key) => {
    envFile[key] = JSON.stringify(dotenv.parsed[key]);
  });
}

// Remove BASE_PATH from envFile for dev purposes only. When set, this adds a /"" to the path in RSBuild which causes some issues.
delete envFile['BASE_PATH'];

export default defineConfig({
  plugins: [
    pluginReact({ swcReactOptions: { runtime: 'classic' } }),
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
        }
      }
    }),
    pluginTypeCheck(),
  ],
  source: {
    include: [/\.(?:ts|tsx|jsx|mts|cts|js)$/],
    assetsInclude: /\.(?:png|jpe?g|gif|svg|mp3|pdf|docx?|xlsx?|woff2?|ttf|eot)$/,
    define: {
      "process.env": JSON.stringify(envFile),
      REQUEST_HEADER: JSON.stringify(path.resolve(__dirname, "common/utils/RequestHeaders.js")),
      GLOBAL_ROUTES: JSON.stringify(path.resolve(__dirname, "src/constants/routes.ts")),

    }
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      ...PATH_ALIASES,
      // Use lodash-es that supports proper tree-shaking
      lodash: "lodash-es",
    },
  },
  output: {
    assetPrefix: './',
  },

  tools: {
    swc: {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
        }
      }

    }

  }
});
