import { defineConfig } from "cypress";

export default defineConfig({
  chromeWebSecurity: false,
  viewportWidth: 1960,
  viewportHeight: 1080,
  videoUploadOnPasses: false,
  supportFolder: "cypress/support",
  defaultCommandTimeout: 15000,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
    // Enable Cypress Studio
    // https://docs.cypress.io/guides/references/cypress-studio
    experimentalStudio: true,
  },
});
