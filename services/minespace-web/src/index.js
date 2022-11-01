import "core-js/stable";
import "regenerator-runtime/runtime";

import React, { Component } from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";

import { MatomoProvider, createInstance } from "@datapunt/matomo-tracker-react";
import { ENVIRONMENT } from "@mds/common";
import App from "./App";
import "antd/dist/antd.less";
import "./styles/index.scss";
import fetchEnv from "./fetchEnv";
import configureStore from "./store/configureStore";

export const store = configureStore();

let instance = {};

export class Index extends Component {
  constructor() {
    super();
    this.state = { environment: false };
    fetchEnv().then(() => {
      if (ENVIRONMENT.matomoUrl) {
        instance = createInstance({
          urlBase: ENVIRONMENT.matomoUrl,
          enableLinkTracking: false,
          siteId: 2,
        });
      }
      this.setState({ environment: true });
    });
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
