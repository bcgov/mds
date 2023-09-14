import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { hot } from "react-hot-loader";
import Routes from "./routes/Routes";
import ModalWrapper from "@/components/common/wrappers/ModalWrapper";
import DocumentViewer from "@/components/syncfusion/DocumentViewer";
import ScrollToTopWrapper from "@/components/common/wrappers/ScrollToTopWrapper";
import configureStore from "./store/configureStore";

export const store = configureStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useKey = (test: (e: KeyboardEvent) => boolean, ref) => {
  useEffect(() => {
    const hotKeyPress = (event: KeyboardEvent) => {
      if (test(event)) {
        event.preventDefault();
        ref.current.focus();
        return;
      }
    };
    document.addEventListener("keydown", hotKeyPress);
    return () => document.removeEventListener("keydown", hotKeyPress);
  });
};

const App = () => {
  return (
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
};

export default hot(module)(App);
