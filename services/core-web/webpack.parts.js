/* eslint-disable */
const webpack = require("webpack");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const path = require("path");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { EsbuildPlugin } = require("esbuild-loader");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin");

const postCSSLoader = {
  loader: "postcss-loader",
  options: {
    postcssOptions: {
      plugins: () => [autoprefixer],
    },
  },
};

const threadLoader = {
  loader: "thread-loader",
  options: {
    workers: 1,
    workerParallelJobs: 50,
    workerNodeArgs: ["--max-old-space-size=3072"],
  },
};

exports.devServer = ({ host, port } = {}) => ({
  cache: {
    // Persist cache to filesystem to speed up consecutive builds.
    type: "filesystem",
  },
  stats: {
    warningsFilter: [/Serializing big strings/],
  },
  devServer: {
    historyApiFallback: true,
    host,
    port,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
    },
    client: {
      overlay: {
        errors: false,
        warnings: false,
      },
    },
  },
});

exports.loadJS = ({ include, exclude } = {}) => ({
  module: {
    rules: [
      {
        test: /\.[[t]sx?$/,
        include,
        exclude,

        loader: "esbuild-loader",
        options: {
          target: "es2015",
        },
      },
      {
        test: /\.[[j]sx?$/,
        include,
        exclude,

        loader: "esbuild-loader",
        options: {
          /// Treat .js files as `.jsx` files
          loader: "jsx",
          target: "es2015",
        },
      },
    ],
  },
});

exports.loadTS = ({ include, exclude } = {}) => ({
  module: {
    rules: [
      {
        test: /\.[ts]x?$/,
        include,
        exclude,

        loader: "esbuild-loader",
        options: {
          target: "es2015",
        },
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
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass"),
              sassOptions: {
                includePaths: [path.resolve(__dirname, "../../node_modules/@syncfusion")],
              },
            },
          },
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
          {
            loader: "less-loader",
            options: {
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
                  "item-hover-bg": "#ded9d9",
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
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass"),
              sassOptions: {
                includePaths: [path.resolve(__dirname, "../../node_modules/@syncfusion")],
              },
            },
          },
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
                  white: "#f1f1f2",
                  blue: "#003366",
                  "primary-color": "#5e46a1",
                  "link-color": "#1DA57A",
                  "success-color": "#45a766",
                  "warning-color": "#f3cd65",
                  "error-color": "#d40d0d",
                  "item-hover-bg": "#ded9d9",
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
        test: /\.(png|jpe?g)$/,
        include,
        exclude,
        loader: "url-loader",
        options: urlLoaderOptions,
      },
      {
        test: /\.(gif|svg)$/,
        include,
        exclude,
        loader: "file-loader",
        options: fileLoaderOptions,
      },
      {
        test: /\.(png|jpe?g)$/,
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
        test: /\.(xls?m|pdf|doc?x|mp3)$/,
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
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
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

exports.bundleOptimization = ({ options, cssOptions } = {}) => ({
  optimization: {
    minimize: true,
    splitChunks: options,
    minimizer: [
      new EsbuildPlugin({
        target: 'es2016'
      }),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: ["default", cssOptions],
        },
      }),
    ],
  },
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

exports.hardSourceWebPackPlugin = () => ({
  plugins: [new HardSourceWebpackPlugin()],
});

exports.clean = () => ({
  plugins: [new CleanWebpackPlugin()],
});

exports.copy = (from, to) => ({
  plugins: [
    new CopyWebpackPlugin({ patterns: [{ from, to, globOptions: { ignore: ["**/index.html"] } }] }),
  ],
});

exports.extractManifest = () => ({
  plugins: [
    new WebpackManifestPlugin({
      fileName: "asset-manifest.json",
    }),
  ],
});
