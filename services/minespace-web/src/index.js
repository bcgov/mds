import "core-js/stable";
import "regenerator-runtime/runtime";

import React, { useState } from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";

import { ReactKeycloakProvider } from "@react-keycloak/web";
import { useIdleTimer } from "react-idle-timer";
import App, { store } from "./App";
import "antd/dist/antd.less";
import "./styles/index.scss";
import fetchEnv from "./fetchEnv";
import keycloak, { keycloakInitConfig } from "./keycloak";
import { unAuthenticateUser } from "./actionCreators/authenticationActionCreator";
import FeatureFlagProvider from "@mds/common/providers/featureFlags/featureFlag.provider";

// 5 minutes before user is inactive- across tabs
const idleTimeout = 5 * 60_000;
// seconds before expiry to request new access token
const refreshTokenBufferSeconds = 60;

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
      console.log("User offline");
    }
  };

  const handleUpdateToken = () => {
    if (keycloak.authenticated && keycloak.tokenParsed) {
      const tokenExpiryTime = keycloak.tokenParsed.exp * 1000;
      const timeToLive = tokenExpiryTime - Date.now() - refreshTokenBufferSeconds * 1000;

      const updateInterval = setInterval(() => {
        if (!isIdle()) {
          keycloak.updateToken(refreshTokenBufferSeconds - 1).catch((err = "") => {
            console.log("Failed to refresh token", err);
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
    <FeatureFlagProvider>
      <ReactKeycloakProvider
        authClient={keycloak}
        initOptions={keycloakInitConfig}
        onTokens={() => {
          handleUpdateToken();
        }}
        onTokenExpired={() => {
          if (!isIdle()) {
            keycloak.updateToken();
          }
        }}
        onReady={() => {
          handleUpdateToken();
        }}
        onAuthLogout={(err = "") => handleAuthErrors(err)}
        onAuthError={(err = "") => handleAuthErrors(err)}
        onAuthRefreshError={(err = "") => handleAuthErrors(err)}
        onInitError={(err = "") => handleAuthErrors(err)}
      >
        <Provider store={store}>
          <App />
        </Provider>
      </ReactKeycloakProvider>
    </FeatureFlagProvider>
  ) : (
    <div />
  );
};

render(<Index />, document.getElementById("root"));
