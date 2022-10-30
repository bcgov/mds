const path = require("path"); // <-get absolute location for saving
const pkg = require("./package.json");
const nodeExternals = require("webpack-node-externals");
module.exports = (mode) => {
  console.log(`\n============= Webpack Mode : ${mode} =============\n`);
  return {
    mode,
    entry: "./src/index.js", // <- starting point for bundle
    output: {
      path: path.resolve(__dirname, "dist"), //<-where to save ur bundle
      filename: "index.js", //<-filename for bundled file
      library: pkg.name,
      libraryTarget: "amd", //<- to which version are we compiling js
    },
    module: {
      rules: [
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
    target: "web",
  };
};
