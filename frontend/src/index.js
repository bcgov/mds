import "core-js/stable";
import "regenerator-runtime/runtime";

import React, { Component } from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";

import App, { store } from "./App";
import "antd/dist/antd.less";
import "./styles/index.scss";
import fetchEnv from "./fetchEnv";

class Index extends Component {
  constructor() {
    super();
    this.state = { environment: false };
    fetchEnv().then(() => {
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
