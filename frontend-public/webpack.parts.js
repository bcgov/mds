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
const AntdScssThemePlugin = require("antd-scss-theme-plugin");

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
        use: [
          "style-loader",
          "css-loader",
          postCSSLoader,
          AntdScssThemePlugin.themify("sass-loader"),
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
          AntdScssThemePlugin.themify("less-loader"),
        ],
      },
    ],
  },
  plugins: [new AntdScssThemePlugin(theme)],
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
          AntdScssThemePlugin.themify("sass-loader"),
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
          AntdScssThemePlugin.themify("less-loader"),
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
