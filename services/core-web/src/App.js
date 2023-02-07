import React from "react";
import { BrowserRouter } from "react-router-dom";
import { hot } from "react-hot-loader";
import Routes from "./routes/Routes";
import ModalWrapper from "@/components/common/wrappers/ModalWrapper";
import DocumentViewer from "@/components/syncfusion/DocumentViewer";
import ScrollToTopWrapper from "@/components/common/wrappers/ScrollToTopWrapper";
import configureStore from "./store/configureStore";

export const store = configureStore();

const App = () => (
  <BrowserRouter basename={process.env.BASE_PATH}>
    <ScrollToTopWrapper>
      <>
        <Routes />
        <ModalWrapper />
        <DocumentViewer />
      </>
    </ScrollToTopWrapper>
  </BrowserRouter>
);

export default hot(module)(App);
