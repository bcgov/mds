import "core-js/stable";
import "regenerator-runtime/runtime";

import React, { Component } from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";

import App, { store } from "./App";
import "antd/dist/antd.less";
import "./styles/index.scss";
import fetchEnv from "./fetchEnv";

import { MatomoProvider, createInstance } from "@datapunt/matomo-tracker-react";
import ENVIRONMENT from "./constants/environment";

class Index extends Component {
  constructor() {
    super();
    this.state = { environment: false };
    fetchEnv().then(() => {
      instance = createInstance({
        urlBase: ENVIRONMENT.matomoUrl,
        enableLinkTracking: false,
      });
      this.setState({ environment: true });
    });
  }

  render() {
    if (this.state.environment) {
      return (
        <Provider store={store}>
          <App />
        </Provider>
      );
    }
    return <div />;
  }
}

render(<Index />, document.getElementById("root"));
