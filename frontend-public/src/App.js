import React, { Component, Fragment } from "react";
import { BrowserRouter } from "react-router-dom";
import Routes from "./routes/Routes";
import { hot } from "react-hot-loader";

class App extends Component {
  render() {
    return (
      <BrowserRouter basename={process.env.BASE_PATH}>
        <Fragment>
          <Routes />
        </Fragment>
      </BrowserRouter>
    );
  }
}

export default hot(module)(App);
