module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': ['ts-jest', {
      "tsConfigFile": "./tsconfig.json",
      isolatedModules: true
    }]
  },
  maxWorkers: 4,
  verbose: true,
  testEnvironmentOptions: {
    url: 'http://localhost'
  },
  testEnvironment: "jest-environment-jsdom-global",
  setupFiles: ["jest-localstorage-mock", "jest-canvas-mock", "./src/setupTests.ts"],
  collectCoverageFrom: ["**/src/**/*.{js,ts,tsx}"],
  moduleNameMapper: {
    "@mds/common/(.*)": "<rootDir>/../common/src/$1",
    "@mds/common": "<rootDir>/../common/src/index",
    "@/(.*)": "<rootDir>/src/$1",
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|pdf|xlsm)$":
      "<rootDir>/src/assetsTransformer.js",
    "\\.(css|less|scss)$": "<rootDir>/src/assetsTransformer.js",
    "^uuid$": "uuid",
    "^esm-browser$": "esm-browser"
  },

  transformIgnorePatterns: ["node_modules", "../../node_modules", "vendor"],
  snapshotSerializers: ["enzyme-to-json/serializer"],
};
