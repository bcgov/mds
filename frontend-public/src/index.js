import "babel-polyfill";
import React, { Component } from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";

import App from "./App";
import "./styles/index.scss";
import fetchEnv from "./fetchEnv";
import configureStore from "./store/configureStore";

export const store = configureStore();

export class Index extends Component {
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
