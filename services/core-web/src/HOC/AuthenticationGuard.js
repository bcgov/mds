import React, { useEffect } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { useKeycloak } from "@react-keycloak/web";
import hoistNonReactStatics from "hoist-non-react-statics";
import { isAuthenticated, getUserAccessData } from "@mds/common/redux/selectors/authenticationSelectors";
import { authenticateUser, storeUserAccessData } from "@mds/common/redux/actions/authenticationActions";
import { USER_ROLES } from "@mds/common";
import NullScreen from "@/components/common/NullScreen";

const propTypes = {
  authenticateUser: PropTypes.func.isRequired,
  storeUserAccessData: PropTypes.func.isRequired,
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
    const { keycloak, initialized } = useKeycloak();

    const authenticate = () => {
      if (!keycloak.authenticated) {
        keycloak.login();
      }
      if (initialized && keycloak.authenticated && !props.isAuthenticated) {
        props.authenticateUser(keycloak.tokenParsed);
        const clientRoles = keycloak.tokenParsed.client_roles || [];
        props.storeUserAccessData(clientRoles);
      }
    };

    authenticate();

    useEffect(() => {
      authenticate();
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

export default AuthenticationGuard;
