const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const path = require('path');

const parts = require('./webpack.parts');

const DEVELOPMENT = 'development';
const PRODUCTION = 'production';
const HOST = process.env.HOST;
const PORT = process.env.PORT;
const ASSET_PATH = process.env.ASSET_PATH || '/';

const PATHS = {
  src: path.join(__dirname, "src"),
  entry: path.join(__dirname, "src", "index.js"),
  public: path.join(__dirname, "public"),
  template: path.join(__dirname, "public", "index.html"),
  build: path.join(__dirname, "build"),
  node_modules: path.join(__dirname, "node_modules"),
};

const BUILD_FILE_NAMES = {
  css: "style/[name].[contenthash:4].css",
  bundle: "js/bundle.[chunkhash:4].js",
  vendor: "js/[id].[chunkhash:4].js",
  assets: "assets/[name].[hash:4].[ext]",
};

const PATH_ALIASES = {
  //Put your aliases here
};

const commonConfig = merge([
  {
    entry: {
      main: PATHS.entry,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: PATHS.template,
      }),
    ],
    resolve: {
      alias: PATH_ALIASES,
    },
  },
  parts.loadJS({
    include: PATHS.src,
  }),
  parts.loadFonts({
    exclude: path.join(PATHS.src, 'assets', 'images'),
    options: {
      name: BUILD_FILE_NAMES.assets,
    },
  }),
]);

const devConfig = merge([
  {
    output: {
      path: PATHS.build,
      publicPath: ASSET_PATH,
      filename: 'bundle.js',
    },
  },
  parts.setEnvironmentVariable(DEVELOPMENT, ASSET_PATH),
  parts.generateSourceMaps({
    type: "eval-source-map",
  }),
  parts.devServer({
    host: HOST,
    port: PORT,
  }),
  parts.loadCSS({
    theme: path.join(PATHS.src, 'styles', 'settings', 'theme.scss')
  }),
  parts.loadImages({
    exclude: path.join(PATHS.src, 'assets', 'fonts'),
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
  parts.clean(PATHS.build),
  parts.setEnvironmentVariable(PRODUCTION, ASSET_PATH),
  parts.extractCSS({
    filename: BUILD_FILE_NAMES.css,
    theme: path.join(PATHS.src, 'styles', 'settings', 'theme.scss'),
  }),
  parts.loadImages({
    exclude: path.join(PATHS.src, 'assets', 'fonts'),
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
        quality: '50-60',
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
          chunks: "initial",
        },
      },
    },
  }),
  parts.CSSOptimization({
    discardComments: {
      removeAll: true,
    },
    safe: true,
  }),
  parts.gZipCompression(),
  parts.registerServiceWorker(),
  parts.extractManifest(),
  parts.copy(PATHS.public, path.join(PATHS.build, 'public')),
]);

module.exports = (mode) => {
  if (mode === PRODUCTION) {
    return merge(commonConfig, prodConfig, { mode });
  }

  if (mode === DEVELOPMENT) {
    return merge(commonConfig, devConfig, { mode });
  }
};
