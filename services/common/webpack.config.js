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
      // Using common JS2 here because JEST is not able to process amd module directly
      // I think webpack when compiling this commonjs2 module will minifiy it and optimize,
      // amd module might be just for direct script based imports and if you don't neeed to test the module with dependencies?
      libraryTarget: "commonjs2", //<- to which version are we compiling js
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
  };
};
