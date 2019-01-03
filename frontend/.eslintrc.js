const path = require("path");

module.exports = {
  parser: "babel-eslint",
  env: {
    browser: true,
    node: true,
    "jest/globals": true,
    es6: true,
  },
  plugins: ["jest"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "airbnb",
    "prettier",
    "prettier/react",
  ],
  settings: {
    "import/resolver": {
      alias: {
        map: [["@", path.join(__dirname, "src")]],
        extensions: [".js", ".json"],
      },
    },
  },
  rules: {
    "react/jsx-filename-extension": "off",
    "no-case-declarations": 0,
    "react/display-name": 0,
    "react/no-deprecated": 0,
    "import/no-named-as-default": 0,
    "jsx-a11y/anchor-is-valid": 0,
    "react/destructuring-assignment": ["error", "never"],
    camelcase: 0,
  },
};
