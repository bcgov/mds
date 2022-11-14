/* eslint-disable */
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const merge = require("webpack-merge");
const path = require("path");
const dotenv = require("dotenv").config({ path: `${__dirname}/.env` });

const parts = require("./webpack.parts");

const DEVELOPMENT = "development";
const PRODUCTION = "production";
const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT || 3000;
const ASSET_PATH = process.env.ASSET_PATH || "/";
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
};

const BUILD_FILE_NAMES = {
  css: "style/[name].[contenthash:4].css",
  bundle: "js/bundle.[chunkhash:4].js",
  vendor: "js/[id].[chunkhash:4].js",
  assets: "assets/[name].[hash:4].[ext]",
};

const PATH_ALIASES = {
  "@": PATHS.src,
  vendor: PATHS.vendor,
  "@common": PATHS.commonPackage,
};

const envFile = {};
envFile.BASE_PATH = JSON.stringify("");
// Populate the env dict with Environment variables from the system
if (process.env) {
  Object.keys(process.env).map((key) => {
    envFile[key] = JSON.stringify(process.env[key]);
  });
  // Update the env dict with any in the .env file
}
if (dotenv.parsed) {
  Object.keys(dotenv.parsed).map((key) => {
    envFile[key] = JSON.stringify(dotenv.parsed[key]);
  });
}

const commonConfig = merge([
  {
    entry: {
      main: PATHS.entry,
    },
    plugins: [
      //new webpack.optimize.ModuleConcatenationPlugin(),
      new HtmlWebpackPlugin({
        template: PATHS.template,
      }),
      // Adding timestamp to builds
      function() {
        this.plugin("watch-run", (watching, callback) => {
          console.log(`Begin compile at ${new Date()}`);
          callback();
        });
      },
    ],
    resolve: {
      alias: {
        ...PATH_ALIASES,
        "react-dom": "@hot-loader/react-dom", // patch react-dom import
      },
    },
  },
  parts.setEnvironmentVariable(envFile),
  parts.loadJS({
    include: [PATHS.src, PATHS.commonPackage],
  }),
  parts.loadFonts({
    exclude: path.join(PATHS.src, "assets", "images"),
    options: {
      name: BUILD_FILE_NAMES.assets,
    },
  }),
  parts.loadFiles({
    include: path.join(PATHS.src, "assets", "downloads"),
  }),
]);

const devConfig = merge([
  {
    output: {
      path: PATHS.build,
      publicPath: ASSET_PATH,
      filename: "bundle.js",
    },
  },
  parts.generateSourceMaps({
    type: "eval-source-map",
  }),
  parts.devServer({
    host: HOST,
    port: PORT,
  }),
  parts.loadCSS({
    theme: path.join(PATHS.src, "styles", "settings", "theme.scss"),
  }),
  parts.loadImages({
    exclude: path.join(PATHS.src, "assets", "fonts"),
  }),
]);

const prodConfig = merge([
  {
    output: {
      path: PATHS.build,
      publicPath: ASSET_PATH,
      chunkFilename: BUILD_FILE_NAMES.vendor,
      filename: BUILD_FILE_NAMES.bundle,
    },
  },
  parts.clean(),
  parts.hardSourceWebPackPlugin(),
  parts.extractCSS({
    filename: BUILD_FILE_NAMES.css,
    theme: path.join(PATHS.src, "styles", "settings", "theme.scss"),
  }),
  parts.loadImages({
    exclude: path.join(PATHS.src, "assets", "fonts"),
    urlLoaderOptions: {
      limit: 10 * 1024,
      name: BUILD_FILE_NAMES.assets,
    },
    fileLoaderOptions: {
      name: BUILD_FILE_NAMES.assets,
    },
    imageLoaderOptions: {
      mozjpeg: {
        progressive: true,
        quality: 40,
      },
      pngquant: {
        quality: [0.50, 0.60],
        speed: 4,
      },
    },
  }),
  parts.bundleOptimization({
    options: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: "all",
        },
      },
    },
  }),
  parts.CSSOptimization({
    discardComments: {
      removeAll: true,
    },
    zindex: false,
    safe: true,
  }),
  parts.extractManifest(),
  parts.copy(PATHS.public, path.join(PATHS.build, "public")),
]);

module.exports = (mode) => {
  if (mode === PRODUCTION) {
    return merge(commonConfig, prodConfig, { mode });
  }

  if (mode === DEVELOPMENT) {
    return merge(commonConfig, devConfig, { mode });
  }
};
