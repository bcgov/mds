/* eslint react/prop-types: 0 */
import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import queryString from "query-string";
import hoistNonReactStatics from "hoist-non-react-statics";
import { useKeycloak } from "@react-keycloak/web";
import { KEYCLOAK } from "@mds/common";
import { isAuthenticated } from "@/selectors/authenticationSelectors";
import { authenticateUser } from "@/actionCreators/authenticationActionCreator";
import { storeUserAccessData } from "@mds/common/redux/actions/authenticationActions";
import UnauthenticatedNotice from "@/components/common/UnauthenticatedNotice";
import Loading from "@/components/common/Loading";
import * as route from "@/constants/routes";
import * as ENV from "@/constants/environment";

/**
 * @constant authenticationGuard - a Higher Order Component Thats checks for user authorization and returns the App component if the user is Authenticated.
 * CORE/IDIR users are authenticated programmatically when MineSpace mounts,
 */

const propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  authenticateUser: PropTypes.func.isRequired,
  storeUserAccessData: PropTypes.func.isRequired,
};

export const AuthenticationGuard = (isPublic) => (WrappedComponent) => {
  const authenticationGuard = (props) => {
    const { keycloak, initialized } = useKeycloak();

    // get guid from pathname - props.location is not available at this level thus cannot directly access props.match.params.id
    const guid = window.location.pathname
      .split("/mines/")
      .pop()
      .split("/")[0];

    const { redirectingFromCore } = queryString.parse(window.location.search);
    const redirectUrl = `${ENV.WINDOW_LOCATION}${route.MINE_DASHBOARD.dynamicRoute(guid)}`;

    // redirectingFromCore check is necessary so that user can stop on the info page if they're not coming from core
    // all routing from core includes 'redirectingFromCore=true', if the user is not authenticated on MineSpace yet, redirect to the Keycloak Login
    if (redirectingFromCore && !keycloak.authenticated && keycloak.initialized) {
      keycloak.login({
        redirectUri: redirectUrl,
        idpHint: KEYCLOAK.bceid_idpHint,
      });
    }

    const authenticate = () => {
      const authenticationInProgressFlag = localStorage.getItem("authenticationInProgressFlag");
      const token = keycloak.tokenParsed ?? null;
      const { type } = queryString.parse(window.location.search);
      const clientRoles = token?.client_roles || [];

      if (keycloak.authenticated && !authenticationInProgressFlag && !type) {
        localStorage.setItem("authenticationInProgressFlag", true);
        props.authenticateUser(token);
        props.storeUserAccessData(clientRoles);
      }
      // standard Authentication flow on initial load,
      // if token exists, authenticate user.
      if (token && !props.isAuthenticated) {
        props.authenticateUser(token);
        props.storeUserAccessData(clientRoles);
      }
    };

    useEffect(() => {
      authenticate();
    }, [keycloak.authenticated]);

    const authenticationInProgressFlag = localStorage.getItem("authenticationInProgressFlag");
    const authorizedToView = props.isAuthenticated || isPublic || keycloak.authenticated;
    const authInProgress = authenticationInProgressFlag || !initialized;

    if (authorizedToView) {
      return <WrappedComponent {...props} />;
    }
    if (authInProgress) {
      return <Loading />;
    }
    return <UnauthenticatedNotice />;
  };

  hoistNonReactStatics(authenticationGuard, WrappedComponent);

  const mapStateToProps = (state) => ({
    isAuthenticated: isAuthenticated(state),
  });

  const mapDispatchToProps = (dispatch) =>
    bindActionCreators(
      {
        authenticateUser,
        storeUserAccessData,
      },
      dispatch
    );

  return connect(mapStateToProps, mapDispatchToProps)(authenticationGuard);
};

AuthenticationGuard.propTypes = propTypes;

export default AuthenticationGuard;
