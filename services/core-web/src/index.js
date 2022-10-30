import "core-js/stable";
import "regenerator-runtime/runtime";

import React, { Component } from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";

import { MatomoProvider, createInstance } from "@datapunt/matomo-tracker-react";
import { setupEnvironment, ENVIRONMENT } from "@mds/common";

import App, { store } from "./App";
import "antd/dist/antd.less";
import "./styles/index.scss";

let instance = {};

setupEnvironment(
  process.env.API_URL,
  "http://localhost:5001",
  process.env.FILESYSTEM_PROVIDER_URL,
  "https://matomo-4c2ba9-test.apps.silver.devops.gov.bc.ca/",
  process.env.KEYCLOAK_CLIENT_ID,
  process.env.KEYCLOAK_RESOURCE,
  process.env.KEYCLOAK_URL,
  process.env.KEYCLOAK_IDP_HINT,
  process.env.KEYCLOAK_IDP_HINT,
  process.env.KEYCLOAK_IDP_HINT,
  "development"
);

class Index extends Component {
  constructor() {
    super();
    this.state = { environment: false };
    instance = createInstance({
      urlBase: ENVIRONMENT.matomoUrl,
      enableLinkTracking: false,
      siteId: 1,
    });
    this.state = { environment: true };
  }

  render() {
    if (this.state.environment) {
      return (
        <Provider store={store}>
          <MatomoProvider value={instance}>
            <App />
          </MatomoProvider>
        </Provider>
      );
    }
    return <div />;
  }
}

render(<Index />, document.getElementById("root"));
