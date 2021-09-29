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

exports.loadCSS = ({ include, exclude } = {}) => ({
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
                  "primary-color": "#003366",
                  "info-color": "#003366",
                  "success-color": "#2e8540",
                  "processing-color": "#003366",
                  "error-color": "#d8292f",
                  "highlight-color": "#d8292f",
                  "warning-color": "#fcba19",
                  "normal-color": "#d9d9d9",
                  white: "#fff",
                  black: "#000",
                  "primary-1": "#00050a",
                  "primary-2": "#000a14",
                  "primary-3": "#000f1f",
                  "primary-4": "#001429",
                  "primary-5": "#002952",
                  "primary-6": "#003366",
                  "primary-7": "#1a4775",
                  "font-family": "BCSans, Noto Sans, Verdana, Arial, sans-serif",
                  "code-family":
                    "SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier, monospace",
                  "font-size-base": "16px",
                  "font-size-lg": "20px",
                  "border-radius-base": "5px",
                  "heading-color": "#003366",
                  "text-selection-bg": "#38598a",
                  "item-hover-bg": "#f0f6fd",
                  "link-color": "#1a5a96",
                  "link-hover-color": "#154878",
                  "link-active-color": "#316ba1",
                  "link-decoration": "underline",
                  "link-hover-decoration": "underline",
                  "border-color-base": "#003366",
                  "border-color-split": "#efefef",
                  "border-width-base": "2px",
                  "background-color-light": "#f7f8fa",
                  "background-color-base": "#f5f5f5",
                  "disabled-color": "#bbbbbb",
                  "disabled-bg": "#bbbbbb",
                  "btn-default-color": "#003366",
                  "btn-default-bg": "#fff",
                  "btn-default-border": "#003366",
                  "btn-danger-color": "#fff",
                  "descriptions-bg": "#f7f8fa",
                  "radio-size": "14px",
                  "radio-dot-color": "#003366",
                  "radio-dot-disabled-color": "#bbbbbb",
                  "layout-body-background": "#fff",
                  "layout-header-background": "#003366",
                  "layout-footer-background": "#003366",
                  "layout-header-height": "80px",
                  "layout-header-padding": "0 50px",
                  "layout-footer-padding": "32px 0px",
                  "layout-sider-background": "#003366",
                  "layout-trigger-height": "48px",
                  "layout-trigger-background": "#000",
                  "layout-zero-trigger-width": "36px",
                  "layout-zero-trigger-height": "42px",
                  "anchor-bg": "#fff",
                  "tooltip-bg": "#003366",
                  "progress-default-color": "#003366",
                  "progress-steps-item-bg": "#f3f3f3",
                  "table-header-bg": "#fff",
                  "table-body-sort-bg": "rgba(0, 0, 0, 0.01)",
                  "table-row-hover-bg": "#f5f5f5",
                  "table-expanded-row-bg": "#fff",
                  "table-header-bg-sm": "transparent",
                  "tag-default-color": "#003366",
                  "rate-star-color": "#fcba19",
                  "card-head-color": "#fff",
                  "card-head-background": "#38598a",
                  "card-background": "#f7f8fa",
                  "card-radius": "0",
                  "back-top-hover-bg": "#999",
                  "back-top-bg": "#003366",
                  "tabs-card-head-background": "#bbb",
                  "tabs-card-active-color": "#003366",
                  "tabs-ink-bar-color": "#003366",
                  "tabs-bar-margin": "0 0 16px 0",
                  "tabs-horizontal-margin": "0 32px 0 0",
                  "tabs-horizontal-padding": "12px 16px",
                  "tabs-horizontal-padding-lg": "16px",
                  "tabs-horizontal-padding-sm": "8px 16px",
                  "tabs-vertical-padding": "8px 24px",
                  "tabs-vertical-margin": "0 0 16px 0",
                  "tabs-highlight-color": "#003366",
                  "tabs-card-gutter": "12px",
                  "tabs-card-tab-active-border-top": "none",
                  "input-color": "#003366",
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

exports.extractCSS = ({ include, exclude, filename } = {}) => ({
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
                  "primary-color": "#003366",
                  "info-color": "#003366",
                  "success-color": "#2e8540",
                  "processing-color": "#003366",
                  "error-color": "#d8292f",
                  "highlight-color": "#d8292f",
                  "warning-color": "#fcba19",
                  "normal-color": "#d9d9d9",
                  white: "#fff",
                  black: "#000",
                  "primary-1": "#00050a",
                  "primary-2": "#000a14",
                  "primary-3": "#000f1f",
                  "primary-4": "#001429",
                  "primary-5": "#002952",
                  "primary-6": "#003366",
                  "primary-7": "#1a4775",
                  "font-family": "BCSans, Noto Sans, Verdana, Arial, sans-serif",
                  "code-family":
                    "SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier, monospace",
                  "font-size-base": "16px",
                  "font-size-lg": "20px",
                  "border-radius-base": "5px",
                  "heading-color": "#003366",
                  "text-selection-bg": "#38598a",
                  "item-hover-bg": "#f0f6fd",
                  "link-color": "#1a5a96",
                  "link-hover-color": "#154878",
                  "link-active-color": "#316ba1",
                  "link-decoration": "underline",
                  "link-hover-decoration": "underline",
                  "border-color-base": "#003366",
                  "border-color-split": "#efefef",
                  "border-width-base": "2px",
                  "background-color-light": "#f7f8fa",
                  "background-color-base": "#f5f5f5",
                  "disabled-color": "#bbbbbb",
                  "disabled-bg": "#bbbbbb",
                  "btn-default-color": "#003366",
                  "btn-default-bg": "#fff",
                  "btn-default-border": "#003366",
                  "btn-danger-color": "#fff",
                  "descriptions-bg": "#f7f8fa",
                  "radio-size": "14px",
                  "radio-dot-color": "#003366",
                  "radio-dot-disabled-color": "#bbbbbb",
                  "layout-body-background": "#fff",
                  "layout-header-background": "#003366",
                  "layout-footer-background": "#003366",
                  "layout-header-height": "80px",
                  "layout-header-padding": "0 50px",
                  "layout-footer-padding": "32px 0px",
                  "layout-sider-background": "#003366",
                  "layout-trigger-height": "48px",
                  "layout-trigger-background": "#000",
                  "layout-zero-trigger-width": "36px",
                  "layout-zero-trigger-height": "42px",
                  "anchor-bg": "#fff",
                  "tooltip-bg": "#003366",
                  "progress-default-color": "#003366",
                  "progress-steps-item-bg": "#f3f3f3",
                  "table-header-bg": "#fff",
                  "table-body-sort-bg": "rgba(0, 0, 0, 0.01)",
                  "table-row-hover-bg": "#f5f5f5",
                  "table-expanded-row-bg": "#fff",
                  "table-header-bg-sm": "transparent",
                  "tag-default-color": "#003366",
                  "rate-star-color": "#fcba19",
                  "card-head-color": "#fff",
                  "card-head-background": "#38598a",
                  "card-background": "#f7f8fa",
                  "card-radius": "0",
                  "back-top-hover-bg": "#999",
                  "back-top-bg": "#003366",
                  "tabs-card-head-background": "#bbb",
                  "tabs-card-active-color": "#003366",
                  "tabs-ink-bar-color": "#003366",
                  "tabs-bar-margin": "0 0 16px 0",
                  "tabs-horizontal-margin": "0 32px 0 0",
                  "tabs-horizontal-padding": "12px 16px",
                  "tabs-horizontal-padding-lg": "16px",
                  "tabs-horizontal-padding-sm": "8px 16px",
                  "tabs-vertical-padding": "8px 24px",
                  "tabs-vertical-margin": "0 0 16px 0",
                  "tabs-highlight-color": "#003366",
                  "tabs-card-gutter": "12px",
                  "tabs-card-tab-active-border-top": "none",
                  "input-color": "#003366",
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
