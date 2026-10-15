// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("./package.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodeExternals = require("webpack-node-externals");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = (opts) => {
  const mode = opts.development ? "development" : "production";
  console.log(`\n============= Webpack Mode : ${mode} =============\n`);
  return {
    watch: mode === "development",
    mode,
    entry: "./src/index.ts",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "index.js",
      libraryTarget: "commonjs2",
    },
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
    watchOptions: {
      // Increase file change poll interval to reduce
      // CPU usage on some operating systems.
      poll: 2500,
      ignored: /node_modules|dist/,
    },
    // async: false (the default for mode: "production") makes webpack fail the
    // build when the TypeScript program reports errors, instead of only logging them.
    plugins: [new ForkTsCheckerWebpackPlugin()],
    module: {
      rules: [
        {
          test: /\.[[t]sx?$/,
          exclude: /node_modules/,
          loader: "esbuild-loader",
          options: {
            target: "es2015",
            tsconfig: "./tsconfig.json",
            minify: false,
          },
        },
        {
          test: /\.[[j]sx?$/,
          exclude: /node_modules/,
          loader: "esbuild-loader",
          options: {
            /// Treat .js files as `.jsx` files
            loader: "jsx",
            target: "es2015",
            minify: false,
          },
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    devtool: "source-map",
  };
};
