import "core-js/stable";
import "regenerator-runtime/runtime";

import React, { useState } from "react";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { render } from "react-dom";
import { Provider } from "react-redux";
import keycloak, { keycloakInitConfig } from "./keycloak";
import Loading from "@/components/common/Loading";

import App, { store } from "./App";
import "antd/dist/antd.less";
import "./styles/index.scss";
import fetchEnv from "./fetchEnv";

const Index = () => {
  const [environment, setEnvironment] = useState(false);

  fetchEnv().then(() => {
    setEnvironment(true);
  });

  return environment ? (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={keycloakInitConfig}
      onEvent={(event, err = "") => {
        console.log(event, err);
        console.log(keycloak);
      }}
      onTokenExpired={keycloak.updateToken}
      onTokens={(token) => console.log("yay tokens", token)}
      LoadingComponent={<Loading />}
      onReady={(authenticated) => {
        console.log("we are ready", authenticated);
      }}
    >
      <Provider store={store}>
        <App />
      </Provider>
    </ReactKeycloakProvider>
  ) : (
    <div />
  );
};

render(<Index />, document.getElementById("root"));
