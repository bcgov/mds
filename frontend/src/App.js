import React, { Fragment } from "react";
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

export default hot(module)(App);
