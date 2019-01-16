import React, { Component, Fragment } from "react";
import { BrowserRouter } from "react-router-dom";
import { hot } from "react-hot-loader";
import Routes from "./routes/Routes";
import DashboardRoutes from "./routes/DashboardRoutes";

class App extends Component {
  render() {
    return (
      <BrowserRouter basename={process.env.BASE_PATH}>
        <Fragment>
          <Routes />
          <DashboardRoutes />
        </Fragment>
      </BrowserRouter>
    );
  }
}

export default hot(module)(App);
