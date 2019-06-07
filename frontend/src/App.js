import React, { Fragment } from "react";
import { compose } from "redux";
import { FetchOnMount } from "@/HOC/FetchOnMount";
import { BrowserRouter } from "react-router-dom";
import Routes from "./routes/Routes";
import { hot } from "react-hot-loader";
import ModalWrapper from "@/components/common/wrappers/ModalWrapper";

const App = () => (
  <BrowserRouter basename={process.env.BASE_PATH}>
    <Fragment>
      <Routes />
      <ModalWrapper />
    </Fragment>
  </BrowserRouter>
);

export default compose(
  hot(module),
  FetchOnMount
)(App);
