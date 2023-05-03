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
  extends: ["eslint:recommended", "plugin:react/recommended", "airbnb", "prettier"],
  settings: {
    "import/resolver": {
      alias: {
        map: [
          ["@", path.join(__dirname, "src")],
          ["vendor", path.join(__dirname, "vendor")],
          ["@common", path.join(__dirname, "common")],
        ],
        extensions: [".js", ".json", ".ts", ".tsx"],
      },
    },
  },
  rules: {
    "react/jsx-filename-extension": "off",
    "no-case-declarations": 0,
    "react/display-name": 0,
    "react/no-deprecated": 0,
    "import/no-named-as-default": 0,
    // TODO: fix unresolved imports for eslint with @common aliases
    "import/no-unresolved": 0,
    "import/extensions": 0,
    "react/jsx-props-no-spreading": "off",
    "jsx-a11y/anchor-is-valid": 0,
    "react/destructuring-assignment": "off",
    camelcase: 0,
    "jsx-a11y/label-has-for": 0, // deprecated rule
    "import/no-cycle": 0,
    "no-param-reassign": 0,
  },
};
