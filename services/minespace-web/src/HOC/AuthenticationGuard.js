import React, { Component, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import queryString from "query-string";
import hoistNonReactStatics from "hoist-non-react-statics";
import { useKeycloak } from "@react-keycloak/web";
import { KEYCLOAK } from "@mds/common";
import { isAuthenticated } from "@/selectors/authenticationSelectors";
import {
  authenticateUser,
  getUserInfoFromToken,
} from "@/actionCreators/authenticationActionCreator";
import UnauthenticatedNotice from "@/components/common/UnauthenticatedNotice";
import Loading from "@/components/common/Loading";
import * as route from "@/constants/routes";
import * as ENV from "@/constants/environment";

/**
 * @constant authenticationGuard - a Higher Order Component Thats checks for user authorization and returns the App component if the user is Authenticated.
 * CORE/IDIR users are authenticated programmatically when MineSpace mounts,
 */

const propTypes = {
  getUserInfoFromToken: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  keycloak: PropTypes.objectOf(PropTypes.any).isRequired,
};

export const AuthenticationGuard = (isPublic) => (WrappedComponent) => {
  const authenticationGuard = (props) => {
    const [authComplete, setAuthComplete] = useState();
    const { keycloak, initialized } = useKeycloak();

    const authenticate = async () => {
      const authenticatingFromCoreFlag = localStorage.getItem("authenticatingFromCoreFlag");
      const token = localStorage.getItem("jwt");
      const { type } = queryString.parse(window.location.search);

      if(keycloak.isAuthenticated && !authenticatingFromCoreFlag && !type) {
        localStorage.setItem("authenticatingFromCoreFlag", true);
        await props.authenticateUser(keycloak.token)
          .then(() => {
            setAuthComplete(true);
          })
          .catch(() => {
            localStorage.removeItem("authenticatingFromCoreFlag");
          })
      }

      // standard Authentication flow on initial load,
      // if token exists, authenticate user.
      if (token && !props.isAuthenticated) {
        await props
          .getUserInfoFromToken(token)
          .then(() => setAuthComplete(true));
      } else {
        setAuthComplete(true);
      }
    }

    useEffect(() => {
      authenticate();
    }, [keycloak.authenticated]);

    useEffect(() => {
      // get guid from pathname - props.location is not available at this level thus cannot directly access props.match.params.id
      const guid = window.location.pathname
        .split("/mines/")
        .pop()
        .split("/")[0];

      const token = localStorage.getItem("jwt");
      const { redirectingFromCore } = queryString.parse(window.location.search);
      const redirectUrl = `${ENV.WINDOW_LOCATION}${route.MINE_DASHBOARD.dynamicRoute(guid)}`;

      // all routing from core includes 'redirectingFromCore=true', if the user is not authenticated on MineSpace yet, redirect to the Keycloak Login
      if (redirectingFromCore && !token) {
        keycloak.login({
          redirectUri: redirectUrl,
          idpHint: KEYCLOAK.bceid_idpHint,
        })
      }
    }, []);

    const { redirectingFromCore } = queryString.parse(window.location.search);
    const authenticatingFromCoreFlag = localStorage.getItem("authenticatingFromCoreFlag");
    const fromCore = !redirectingFromCore && !authenticatingFromCoreFlag;
    if (props.isAuthenticated || isPublic) {
      return <WrappedComponent {...props} />;
    }
    if (!props.isAuthenticated && authComplete && fromCore) {
      return <UnauthenticatedNotice />;
    }
    return <Loading />;
  }

  hoistNonReactStatics(authenticationGuard, WrappedComponent);

  const mapStateToProps = (state) => ({
    isAuthenticated: isAuthenticated(state),
  });

  const mapDispatchToProps = (dispatch) =>
    bindActionCreators(
      {
        getUserInfoFromToken,
        authenticateUser,
      },
      dispatch
    );


  return connect(mapStateToProps, mapDispatchToProps)(authenticationGuard);
};

AuthenticationGuard.propTypes = propTypes;

export default AuthenticationGuard;
