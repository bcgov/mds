import React, { useEffect } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { useKeycloak } from "@react-keycloak/web";
import hoistNonReactStatics from "hoist-non-react-statics";
import {
  isAuthenticated,
  getKeycloak,
  getUserAccessData,
} from "@common/selectors/authenticationSelectors";
import {
  authenticateUser,
  storeKeycloakData,
  storeUserAccessData,
} from "@common/actions/authenticationActions";
import { USER_ROLES } from "@mds/common";
import { getUserInfo } from "@common/actionCreators/mineActionCreator";
import NullScreen from "@/components/common/NullScreen";

const propTypes = {
  authenticateUser: PropTypes.func.isRequired,
  storeUserAccessData: PropTypes.func.isRequired,
  storeKeycloakData: PropTypes.func.isRequired,
  getUserInfo: PropTypes.func.isRequired,
  keycloak: PropTypes.objectOf(PropTypes.any).isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  userAccessData: PropTypes.arrayOf(PropTypes.any).isRequired,
};

/**
 * @constant authenticationGuard - a Higher Order Component Thats checks for user authorization and returns the App component if the user is Authenticated.
 */
export const AuthenticationGuard = (WrappedComponent) => {
  /**
   * Initializes the KeyCloak client and enables
   * redirects directly to IDIR login page.
   *
   * The method uses async/awaits instead of promises
   * because we were facing troubles with promise resolving
   * and changing state.
   *
   */
  const authenticationGuard = (props) => {
    console.log("authentication guard constructor");
    const { keycloak, initialized } = useKeycloak();

    const checkLogin = () => {
      if (!keycloak.authenticated) {
        keycloak.login();
      }
      if (initialized && keycloak.authenticated && !props.isAuthenticated) {
        props.authenticateUser(keycloak.tokenParsed);
        const clientRoles = keycloak.tokenParsed.client_roles || []; // might want idir_username instead of preferred_username
        props.storeUserAccessData(clientRoles);
        props.storeKeycloakData(keycloak);
      }
    };

    checkLogin();

    useEffect(() => {
      console.log("auth guard use effect called!");
      checkLogin();
    }, [initialized, keycloak.authenticated]);

    const isAuthorized =
      props.userAccessData.includes(USER_ROLES.role_view) &&
      !props.userAccessData.includes(USER_ROLES.role_minespace_proponent);

    return isAuthorized ? <WrappedComponent {...props} /> : <NullScreen type="unauthorized" />;
  };
  authenticationGuard.propTypes = propTypes;

  hoistNonReactStatics(authenticationGuard, WrappedComponent);

  const mapStateToProps = (state) => ({
    isAuthenticated: isAuthenticated(state),
    userAccessData: getUserAccessData(state),
    keycloak: getKeycloak(state),
  });

  const mapDispatchToProps = (dispatch) =>
    bindActionCreators(
      {
        authenticateUser,
        storeUserAccessData,
        storeKeycloakData,
        getUserInfo,
      },
      dispatch
    );

  return connect(mapStateToProps, mapDispatchToProps)(authenticationGuard);
};

export default AuthenticationGuard;
