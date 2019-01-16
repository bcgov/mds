import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import hoistNonReactStatics from "hoist-non-react-statics";
import { isAuthenticated, getKeycloak } from "@/selectors/authenticationSelectors";
import { authenticateUser, storeKeycloakData } from "@/actions/authenticationActions";

/**
 * @constant AuthenticationGuard - a Higher Order Component Thats checks for user authorization and returns the App component if the user is Authenticated.
 */

export const AuthenticationGuard = (WrappedComponent) => {
  const authenticationGuard = () => <WrappedComponent />;

  hoistNonReactStatics(authenticationGuard, WrappedComponent);

  const mapStateToProps = (state) => ({
    isAuthenticated: isAuthenticated(state),
    keycloak: getKeycloak(state),
  });

  const mapDispatchToProps = (dispatch) =>
    bindActionCreators(
      {
        authenticateUser,
        storeKeycloakData,
      },
      dispatch
    );

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(authenticationGuard);
};

export default AuthenticationGuard;
