import "core-js/stable";
import "regenerator-runtime/runtime";

import React, { useState } from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";

import { ReactKeycloakProvider } from "@react-keycloak/web";
import { useIdleTimer } from "react-idle-timer";
import App from "./App";
import "antd/dist/antd.less";
import "./styles/index.scss";
import fetchEnv from "./fetchEnv";
import configureStore from "./store/configureStore";
import keycloak, { keycloakInitConfig } from "./keycloak";
import { unAuthenticateUser } from "./actionCreators/authenticationActionCreator";

// eslint-disable-next-line import/prefer-default-export
export const store = configureStore();

// 60 seconds before user is inactive- across tabs
const idleTimeout = 60_000;

const Index = () => {
  const [environment, setEnvironment] = useState(false);

  fetchEnv().then(() => {
    setEnvironment(true);
  });

  const { isIdle } = useIdleTimer({
    timeout: idleTimeout,
    throttle: 500,
    crossTab: true,
    syncTimers: 1000, // the value of this property is the duration of the throttle on the sync operation
    events: [
      "mousemove",
      "keydown",
      "wheel",
      "DOMMouseScroll",
      "mousewheel",
      "mousedown",
      "touchstart",
      "touchmove",
      "MSPointerDown",
      "MSPointerMove",
      "visibilitychange",
      "focus",
    ],
  });

  const handleAuthErrors = (err = "") => {
    console.log("Authentication error", err);
    if (!keycloak.authenticated || keycloak.isTokenExpired()) {
      store.dispatch(unAuthenticateUser());
      keycloak.clearToken();
    } else {
      console.log("user offline");
    }
  };

  const handleUpdateToken = () => {
    if (keycloak.authenticated) {
      const tokenExpiryTime = keycloak.tokenParsed.exp * 1000 ?? null;
      const bufferSeconds = 60;
      const timeToLive = tokenExpiryTime - Date.now() - bufferSeconds * 1000;

      const updateInterval = setInterval(() => {
        if (!isIdle()) {
          keycloak.updateToken(-1).catch((err = "") => {
            console.log("failed to refresh token", err);
            handleAuthErrors();
          });
        }
      }, timeToLive);

      return () => {
        clearInterval(updateInterval);
      };
    }
    return false;
  };

  return environment ? (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={keycloakInitConfig}
      onTokens={() => {
        handleUpdateToken();
      }}
      onReady={() => {
        handleUpdateToken();
      }}
      onEvent={(event, err = "") => {
        console.log(event, err);
      }}
      onAuthLogout={(err = "") => handleAuthErrors(err)}
      onAuthError={(err = "") => handleAuthErrors(err)}
      onAuthRefreshError={(err = "") => handleAuthErrors(err)}
      onInitError={(err = "") => handleAuthErrors(err)}
      onTokenExpired={() => {
        if (!isIdle()) {
          keycloak.updateToken();
        }
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
