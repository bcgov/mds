// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: [
      "./services/common/tsconfig.json",
      "./services/minespace-web/tsconfig.json",
      "./services/core-web/tsconfig.json",
    ],
  },
  env: {
    browser: true,
    node: true,
    "jest/globals": true,
    es6: true,
  },
  plugins: ["jest", "@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "airbnb-typescript",
    "prettier",
  ],
  settings: {
    "import/parser": {
      "typescript-eslint-parser": [".ts", ".tsx"],
    },
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
    "no-shadow": 0,
    "@typescript-eslint/no-shadow": 1,
    "@typescript-eslint/no-unused-vars": 1,
    "import/no-extraneous-dependencies": 0,
    "@typescript-eslint/quotes": [2, "double"],
    "@typescript-eslint/indent": [0, 4],
    "@typescript-eslint/comma-dangle": 0,
    "@typescript-eslint/naming-convention": 0,
    "react/prop-types": 0,
    "@typescript-eslint/ban-ts-comment": 0,
    "@typescript-eslint/default-param-last": 0,
    "@typescript-eslint/no-explicit-any": 1,
  },
};
