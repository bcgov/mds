// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("./package.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodeExternals = require("webpack-node-externals");

module.exports = (mode) => {
  console.log(`\n============= Webpack Mode : ${mode} =============\n`);
  return {
    mode,
    entry: "./src/index.ts",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "index.js",
      library: pkg.name,
      libraryTarget: "commonjs2",
    },
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: ["babel-loader", "ts-loader"],
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
  };
};
