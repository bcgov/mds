const webpack = require("webpack");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const UglifyWebpackPlugin = require("uglifyjs-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const ManifestPlugin = require("webpack-manifest-plugin");
const SWPrecacheWebpackPlugin = require("sw-precache-webpack-plugin");
const AntdScssThemePlugin = require('antd-scss-theme-plugin');

const postCSSLoader = {
  loader: "postcss-loader",
  options: {
    plugins: () => ([autoprefixer]),
  },
};

exports.devServer = ({ host, port } = {}) => ({
  devServer: {
    historyApiFallback: true,
    stats: "errors-only",
    host,
    port,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    },
    overlay: {
      errors: true,
      warnings: true,
    },
  },
});

exports.loadJS = ({ include, exclude } = {}) => ({
  module: {
    rules: [
      {
        test: /\.js$/,
        include,
        exclude,
        loader: "babel-loader",
      },
    ],
  },
});

exports.loadCSS = ({ include, exclude, theme } = {}) => ({
  module: {
    rules: [
      {
        test: /\.s?css$/,
        include,
        exclude,
        use: [
          "style-loader",
          "css-loader",
          postCSSLoader,
          AntdScssThemePlugin.themify('sass-loader'),
        ],
      },
      {
        test: /\.less$/,
        include,
        exclude,
        use: [
          "style-loader",
          "css-loader",
          postCSSLoader,
          AntdScssThemePlugin.themify('less-loader'),
        ],
      },
    ],
  },
  plugins: [
    new AntdScssThemePlugin(theme),
  ],
});

exports.extractCSS = ({ include, exclude, filename, theme } = {}) => ({
  module: {
    rules: [
      {
        test: /\.s?css$/,
        include,
        exclude,
        use: [
          "style-loader",
          MiniCssExtractPlugin.loader,
          "css-loader",
          postCSSLoader,
          AntdScssThemePlugin.themify('sass-loader'),
        ],
      },
      {
        test: /\.less$/,
        include,
        exclude,
        use: [
          "style-loader",
          MiniCssExtractPlugin.loader,
          "css-loader",
          postCSSLoader,
          AntdScssThemePlugin.themify('less-loader'),
        ],
      },
    ],
  },
  plugins: [
    new AntdScssThemePlugin(theme),
    new MiniCssExtractPlugin({
      filename,
    }),
  ],
});

exports.loadImages = ({ include, exclude, urlLoaderOptions, fileLoaderOptions, imageLoaderOptions} = {}) => ({
  module: {
    rules: [
      {
        test: /\.(gif|png|jpe?g)$/,
        include,
        exclude,
        loader: "url-loader",
        options: urlLoaderOptions,
      },
      {
        test: /\.svg$/,
        include,
        exclude,
        loader: "file-loader",
        options: fileLoaderOptions,
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/,
        include,
        exclude,
        loader: "image-webpack-loader",
        options: {
          bypassOnDebug: true,
          ...imageLoaderOptions,
        },
      },
    ],
  },
});

exports.loadFonts = ({ include, exclude, options } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        include,
        exclude,
        use: {
          loader: "file-loader",
          options,
        },
      },
    ],
  },
});

exports.generateSourceMaps = ({ type } = {}) => ({
  devtool: type,
});

exports.bundleOptimization = ({ options } = {}) => ({
  optimization: {
    splitChunks: options,
    minimizer: [new UglifyWebpackPlugin()],
  },
});

exports.CSSOptimization = ({ options } = {}) => ({
  plugins: [
    new OptimizeCSSAssetsPlugin({
      cssProcessor: cssnano,
      cssProcessorOptions: options,
      canPrint: false,
    }),
  ],
});

exports.setEnvironmentVariable = (env, assetPath) => ({
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(env),
        ASSET_PATH: JSON.stringify(assetPath),
      },
    }),
  ],
});

exports.gZipCompression = () => ({
  plugins: [
    new CompressionPlugin({
      algorithm: "gzip",
    }),
  ],
});

exports.clean = (path) => ({
  plugins: [
    new CleanWebpackPlugin([
      path,
    ]),
  ],
});

exports.copy = (from, to) => ({
  plugins: [
    new CopyWebpackPlugin([
      { from, to, ignore: [ "*.html"] },
    ]),
  ],
});

exports.registerServiceWorker = () => ({
  plugins: [
    new SWPrecacheWebpackPlugin({
      dontCacheBustUrlsMatching: /\.\w{8}\./,
      filename: "service-worker.js",
      minify: true,
      navigateFallback: "/index.html",
      staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
    }),
  ],
});

exports.extractManifest = () => ({
  plugins: [
    new ManifestPlugin({
      fileName: "asset-manifest.json",
    }),
  ],
});
