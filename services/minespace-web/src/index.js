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
const bufferSeconds = 12 * 60;

const Index = () => {
  // const initialToken = keycloak?.tokenParsed?.exp ? keycloak.tokenParsed.exp * 1000 : null;
  // console.log(keycloak);
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

  const handleAuthErrors = () => {
    keycloak.clearToken();
  }

  const handleUpdateToken = () => {
    // const tokenExpiryTime = keycloak?.tokenParsed?.exp ? keycloak.tokenParsed.exp * 1000 : null;
    if (tokenExpiryTime) {
      console.log(keycloak);
      console.log('tokenExpiryTime', new Date(tokenExpiryTime));
      console.log('tokenExpiryTimeFromKeyCloak', new Date(keycloak.tokenParsed?.exp * 1000))
      console.log('refreshExpiryTime', new Date(keycloak.refreshTokenParsed?.exp * 1000))
      let bufferSeconds = 14 * 60; // 12 minutes * 60 seconds per minute
      const timeToLive = tokenExpiryTime - Date.now() - (bufferSeconds * 1000);
      const isActive = getRemainingTime() > 0;

      console.log('timeToLive', timeToLive)

      const updateInterval = setInterval(() => {
        console.log('updateTimeout callback')
        if (isActive) {
          console.log('is active! Update token')
          console.log(keycloak.tokenParsed)
          // updatetoken takes minValidity in seconds
          // so does isTokenExpired
          // console.log(keycloak.isTokenExpired(bufferSeconds + 1));
          keycloak.updateToken(bufferSeconds + 1)
            .then((wasUpdated) => {
              console.log('token updated!!!', wasUpdated)
              console.log(keycloak.tokenParsed);
            })
            .catch((err="") => {
              console.log('failed to refresh token', err);
              console.log(keycloak.refreshTokenParsed);
            }) // returns a promise
          console.log(keycloak.tokenParsed)
        }        
      }, timeToLive)

      return () => {
        clearInterval(updateInterval)
      }
    }
  }

  useEffect(() => {
    handleUpdateToken();    
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
              let accessTokenExpiry = keycloak.tokenParsed.exp * 1000;
              localStorage.setItem("refresh_token_expiry", keycloak.refreshTokenParsed.exp * 1000);
              localStorage.setItem("access_token_expiry", accessTokenExpiry);

              setTokenExpiryTime(accessTokenExpiry);
            }   
          }}
          onEvent={(event, err="") => {console.log('keycloak event!'); console.log(event, err); console.log(keycloak);}}
          onTokenExpired={(val) => console.log("token expired", val)}
          onReady={(authenticated) => {
            if (authenticated) {
              handleUpdateToken();
            }
          }}
        >
          <Provider store={store}>
            <App />
          </Provider>
        </ReactKeycloakProvider>
  ) : (<div />);
};

render(<Index />, document.getElementById("root"));
