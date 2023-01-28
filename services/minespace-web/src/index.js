import "core-js/stable";
import "regenerator-runtime/runtime";

import React, { useEffect, useState } from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";

import { ReactKeycloakProvider } from "@react-keycloak/web";
import App from "./App";
import "antd/dist/antd.less";
import "./styles/index.scss";
import fetchEnv from "./fetchEnv";
import configureStore from "./store/configureStore";
import keycloak, { keycloakInitConfig } from "./keycloak";
import { useIdleTimer } from 'react-idle-timer';

export const store = configureStore();

const idleTimeout = 60_000; // 1 minute?

const Index = () => {
  const [environment, setEnvironment] = useState(false);
  const [tokenExpiryTime, setTokenExpiryTime] = useState(null)

  fetchEnv().then(() => {
    setEnvironment(true);
  });

  const {getRemainingTime, activate} = useIdleTimer({
    timeout: idleTimeout,
    throttle: 500,
    crossTab: true,
    syncTimers: 1000, // the value of this property is the duration of the throttle on the sync operation
    events: [
      'mousemove',
      'keydown',
      'wheel',
      'DOMMouseScroll',
      'mousewheel',
      'mousedown',
      'touchstart',
      'touchmove',
      'MSPointerDown',
      'MSPointerMove',
      'visibilitychange',
      'focus'
    ]
  });

  useEffect(() => {
    if (tokenExpiryTime) {
      const bufferSeconds = 10;
      const timeToLive = tokenExpiryTime - Date.now() - (bufferSeconds * 1000);
      const isActive = getRemainingTime() > 0;

      console.log('timeToLive', timeToLive)

      const updateTimeout = setTimeout(() => {
        if (isActive) {
          console.log('is active! Update token')
          keycloak.updateToken(bufferSeconds)
        }        
      }, timeToLive)

      return () => {
        clearTimeout(updateTimeout)
      }
    }
    
  }, [tokenExpiryTime])

  return environment ? (
    <ReactKeycloakProvider
          authClient={keycloak}
          initOptions={keycloakInitConfig}
          onTokens={(token) => {
            // initially we receive empty values
            if (token && keycloak.authenticated) {
              localStorage.setItem("id_token", token.idToken);
              localStorage.setItem("refresh_token", token.refreshToken);
              localStorage.setItem("token", token.token);
              localStorage.setItem("refresh_token_expiry", keycloak.refreshTokenParsed.exp * 1000);
              localStorage.setItem("access_token_expiry", keycloak.tokenParsed.exp * 1000);

              setTokenExpiryTime(keycloak.tokenParsed.exp * 1000);
            }   
          }}
          onEvent={(event, err="") => {console.log('keycloak event!'); console.log(event, err); console.log(keycloak);}}
          onTokenExpired={(val) => console.log("token expired", val)}
        >
          <Provider store={store}>
            <App />
          </Provider>
        </ReactKeycloakProvider>
  ) : (<div />);
};

render(<Index />, document.getElementById("root"));
