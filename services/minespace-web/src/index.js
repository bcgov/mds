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
import { unAuthenticateUser } from "./actionCreators/authenticationActionCreator";

export const store = configureStore();

// 60 seconds before user is inactive- across tabs
const idleTimeout = 60_000;

const Index = () => {
  const [environment, setEnvironment] = useState(false);
  const [tokenExpiryTime, setTokenExpiryTime] = useState(null)

  fetchEnv().then(() => {
    setEnvironment(true);
  });

  const { getRemainingTime } = useIdleTimer({
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

  const handleAuthErrors = (err="") => {
    console.log('handleAuthErrors!', err);
    console.log(keycloak);
    console.log(keycloak.authenticated, 'authenticated');
    console.log(keycloak.isTokenExpired(), 'token expired?')
    keycloak.logout();
    // keycloak.clearToken();
    unAuthenticateUser("Toast message");
  }

  const handleUpdateToken = () => {
    if (tokenExpiryTime) {
      const bufferSeconds = 14 * 60;
      const timeToLive = tokenExpiryTime - Date.now() - (bufferSeconds * 1000);
      const isActive = getRemainingTime() > 0;

      const updateInterval = setInterval(() => {
        if (isActive) {
          keycloak.updateToken(-1)
            .catch((err="") => {
              console.log('failed to refresh token', err);
              handleAuthErrors();
            }) 
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
            // initially we receive empty values for token
            if (token && keycloak.authenticated) {
              let accessTokenExpiry = keycloak.tokenParsed.exp * 1000;
              setTokenExpiryTime(accessTokenExpiry);
            }   
          }}
          onReady={(authenticated) => {
            if (authenticated) {
              handleUpdateToken();
            }
          }}
          onEvent={(event, err="") => {console.log(event, err)}}
          onAuthLogout={(err="") => handleAuthErrors(err)}
          onAuthError={(err="") => handleAuthErrors(err)}
          onAuthRefreshError={(err="") => handleAuthErrors(err)}
          onInitError={(err="") => handleAuthErrors(err)}
          onTokenExpired={keycloak.updateToken}
        >
          <Provider store={store}>
            <App />
          </Provider>
        </ReactKeycloakProvider>
  ) : (<div />);
};

render(<Index />, document.getElementById("root"));
