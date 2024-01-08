module.exports = {
  env: {
    test: {
      presets: [
        [
          "@babel/preset-env",
          {
            useBuiltIns: "entry",
            corejs: 3,
            targets: { node: "current", ie: "8" },
          },
        ],
        ["@babel/preset-react"],
      ],
      plugins: [
        [
          "import",
          {
            libraryName: "antd",
            style: true,
          },
        ],
        "babel-plugin-transform-class-properties",
      ],
    },
  },
};
