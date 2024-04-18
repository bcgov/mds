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
    testEnvironment: 'jest-environment-jsdom-global',
    setupFiles: [
        './src/setupTests.js',
        'jest-localstorage-mock',
        'jest-canvas-mock',
    ],
    snapshotFormat: {
        escapeString: true,
        printBasicPrototype: true
    },
    collectCoverageFrom: [
        '**/common/**/*.{js,ts,tsx}',
        '**/src/**/*.{js,ts,tsx}',
        '!src/index.{js,ts,tsx}',
        '!src/App.{js,ts,tsx}',
        '!src/fetchEnv.{js,ts,tsx}',
        '!src/assetsTransformer.{js,ts,tsx}',
        '!src/setupTests.{js,ts,tsx}',
        '!src/components/modalContent/config.{js,ts,tsx}',
        '!src/manualReporting/renderReport.{js,ts,tsx}',
    ],
    moduleNameMapper: {
        '@common/(.*)': '<rootDir>/common/$1',
        '@mds/common/(.*)': '<rootDir>/../common/src/$1',
        '@mds/common': '<rootDir>/../common/src/index',
        '@/(.*)': '<rootDir>/src/$1',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|pdf|xlsm)$': '<rootDir>/src/assetsTransformer.js',
        '\\.(css|less|scss)$': '<rootDir>/src/assetsTransformer.js',
        "^vendor/(.*)$": "<rootDir>/vendor/$1",
        "^uuid$": "uuid",
        "^esm-browser$": "esm-browser"

    },

    transformIgnorePatterns: [
        'node_modules',
        '../../node_modules',
        '../common/node_modules',
        'vendor',
    ],
    snapshotSerializers: [
        'enzyme-to-json/serializer',
    ]

}