import React, { Fragment } from "react";
import { BrowserRouter } from "react-router-dom";
import { hot } from "react-hot-loader";
import Routes from "./routes/Routes";
import ModalWrapper from "@/components/common/wrappers/ModalWrapper";
import configureStore from "./store/configureStore";

export const store = configureStore();

const App = () => (
  <BrowserRouter basename={process.env.BASE_PATH}>
    <Fragment>
      <Routes />
      <ModalWrapper />
    </Fragment>
  </BrowserRouter>
);

export default hot(module)(App);
