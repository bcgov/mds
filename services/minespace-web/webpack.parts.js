/* eslint-disable */
const webpack = require("webpack");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin");

const ManifestPlugin = require("webpack-manifest-plugin");

const postCSSLoader = {
  loader: "postcss-loader",
  options: {
    plugins: () => [autoprefixer],
  },
};

exports.devServer = ({ host, port } = {}) => ({
  devServer: {
    historyApiFallback: true,
    stats: "errors-only",
    host,
    port,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
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
        loader: [
          {
            loader: "thread-loader",
            options: {
              workers: 1,
              workerParallelJobs: 50,
              workerNodeArgs: ["--max-old-space-size=1024"],
            },
          },
          "babel-loader?cacheDirectory",
        ],
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
        use: ["style-loader", "css-loader", postCSSLoader, "sass-loader"],
      },
      {
        test: /\.less$/,
        include,
        exclude,
        use: [
          "style-loader",
          "css-loader",
          postCSSLoader,
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                javascriptEnabled: true,
                modifyVars: {
                  "layout-body-background": "#fff", //#f0f2f5;
                  "layout-header-background": "#003366", //#001529;
                  "layout-footer-background": "#003366", //$layout-body-background;
                  "layout-header-height": "80px", //64px;
                  "layout-header-padding": "0 50px",
                  "layout-footer-padding": "32px 0px",
                  white: "#fff",
                  black: "#000",
                  "info-color": "#003366",
                  "link-color": "#1a5a96",
                  "success-color": "#2e8540",
                  "processing-color": "#003366",
                  "warning-color": "#fcba19",
                  "error-color": "#d40d0d",
                  "highlight-color": "#d40d0d",
                  "primary-color": "#003366",
                  "normal-color": "#d9d9d9",
                  "item-hover-bg": "#ded9d9",
                  "background-color-light": "#f7f8fa",
                  "item-hover-bg": "#ded9d9",
                  "table-selected-row-bg": "#ded9d9",
                  "font-size-base": "16px",
                  "font-size-lg": "20px",
                  "font-size-sm": "12px",
                  "font-family": '"BCSans", "Noto Sans", Verdana, Arial, sans-serif',
                  "border-radius-base": "5px",
                  "body-background": "#fff",
                  "component-background": "#fff",
                  "popover-background": "#fff",
                  "tabs-card-head-background": "#bbbbbb",
                  "tabs-card-height": "40px",
                  "tabs-card-active-color": "#fff",
                  "tabs-title-font-size": "16px",
                  "tabs-title-font-size-lg": "20px",
                  "tabs-title-font-size-sm": "16px",
                  "tabs-ink-bar-color": " #003366",
                  "tabs-bar-margin": "0 0 16px 0",
                  "tabs-horizontal-margin": "0 32px 0 0",
                  "tabs-horizontal-margin-rtl": "0 0 0 32px",
                  "tabs-horizontal-padding": "12px 16px",
                  "tabs-horizontal-padding-lg": "16px",
                  "tabs-horizontal-padding-sm": "8px 16px",
                  "tabs-vertical-padding": "8px 24px",
                  "tabs-vertical-margin": "0 0 16px 0",
                  "tabs-scrolling-size": "32px",
                  "tabs-highlight-color": "#003366",
                  "tabs-hover-color": "#003366",
                  "tabs-active-color": "#003366",
                  "tabs-card-gutter": "12px",
                  "tabs-card-tab-active-border-top": "none",
                },
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [],
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
          "sass-loader",
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
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                javascriptEnabled: true,
                modifyVars: {
                  "layout-body-background": "#fff", //#f0f2f5;
                  "layout-header-background": "#003366", //#001529;
                  "layout-footer-background": "#003366", //$layout-body-background;
                  "layout-header-height": "80px", //64px;
                  "layout-header-padding": "0 50px",
                  "layout-footer-padding": "32px 0px",
                  white: "#fff",
                  black: "#000",
                  "info-color": "#003366",
                  "link-color": "#1a5a96",
                  "success-color": "#2e8540",
                  "processing-color": "#003366",
                  "warning-color": "#fcba19",
                  "error-color": "#d40d0d",
                  "highlight-color": "#d40d0d",
                  "primary-color": "#003366",
                  "normal-color": "#d9d9d9",
                  "item-hover-bg": "#ded9d9",
                  "background-color-light": "#f7f8fa",
                  "item-hover-bg": "#ded9d9",
                  "table-selected-row-bg": "#ded9d9",
                  "font-size-base": "16px",
                  "font-size-lg": "20px",
                  "font-size-sm": "12px",
                  "font-family": '"BCSans", "Noto Sans", Verdana, Arial, sans-serif',
                  "border-radius-base": "5px",
                  "body-background": "#fff",
                  "component-background": "#fff",
                  "popover-background": "#fff",
                  "tabs-card-head-background": "#bbbbbb",
                  "tabs-card-height": "40px",
                  "tabs-card-active-color": "#fff",
                  "tabs-title-font-size": "16px",
                  "tabs-title-font-size-lg": "20px",
                  "tabs-title-font-size-sm": "16px",
                  "tabs-ink-bar-color": " #003366",
                  "tabs-bar-margin": "0 0 16px 0",
                  "tabs-horizontal-margin": "0 32px 0 0",
                  "tabs-horizontal-margin-rtl": "0 0 0 32px",
                  "tabs-horizontal-padding": "12px 16px",
                  "tabs-horizontal-padding-lg": "16px",
                  "tabs-horizontal-padding-sm": "8px 16px",
                  "tabs-vertical-padding": "8px 24px",
                  "tabs-vertical-margin": "0 0 16px 0",
                  "tabs-scrolling-size": "32px",
                  "tabs-highlight-color": "#003366",
                  "tabs-hover-color": "#003366",
                  "tabs-active-color": "#003366",
                  "tabs-card-gutter": "12px",
                  "tabs-card-tab-active-border-top": "none",
                },
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename,
    }),
  ],
});

exports.loadImages = ({
  include,
  exclude,
  urlLoaderOptions,
  fileLoaderOptions,
  imageLoaderOptions,
} = {}) => ({
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

exports.loadFiles = ({ include, exclude } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(xls?m|pdf|doc?x)$/,
        include,
        exclude,
        loader: "file-loader",
        options: {
          name: "[path][name].[ext]",
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
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        terserOptions: {
          compress: false,
        },
      }),
    ],
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

exports.setEnvironmentVariable = (dotenv = {}) => ({
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        ...dotenv,
      },
    }),
  ],
});

exports.hardSourceWebPackPlugin = () => {
  return {
    plugins: [new HardSourceWebpackPlugin()],
  };
};

exports.clean = () => ({
  plugins: [new CleanWebpackPlugin()],
});

exports.copy = (from, to) => ({
  plugins: [new CopyWebpackPlugin([{ from, to, ignore: ["*.html"] }])],
});

exports.extractManifest = () => ({
  plugins: [
    new ManifestPlugin({
      fileName: "asset-manifest.json",
    }),
  ],
});
