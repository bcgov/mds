import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Keycloak from "keycloak-js";
import hoistNonReactStatics from "hoist-non-react-statics";
import { isAuthenticated, getKeycloak } from "@/selectors/authenticationSelectors";
import { authenticateUser, storeKeycloakData } from "@/actions/authenticationActions";
import { KEYCLOAK } from "@/constants/environment";
import NullScreen from "@/components/common/NullScreen";
import Loading from "@/components/common/Loading";

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
  class authenticationGuard extends Component {
    componentDidMount() {
      this.keycloakInit();
    }

    async keycloakInit() {
      // Initialize client
      const keycloak = Keycloak(KEYCLOAK);
      await keycloak.init();

      // Prompt for login using IDIR if not authenticated
      if (!keycloak.authenticated) {
        await keycloak.login({
          idpHint: KEYCLOAK.idpHint,
        });
      }

      // Fetch user info and roles and store them in local storage
      const userInfo = await keycloak.loadUserInfo();
      localStorage.setItem("jwt", keycloak.token);
      this.props.storeKeycloakData(keycloak);
      this.props.authenticateUser(userInfo);
    }

    render() {
      if (this.props.keycloak) {
        if (this.props.isAuthenticated) {
          return <WrappedComponent {...this.props} />;
        }
        // Add this block back in once there are user permissions to check against, ie user logs in with BCeID but permissions have not been updated on keycloak.
        // if (!this.props.isAuthenticated) {
        //   return <NullScreen type="unauthorized" />;
        // }
        return <Loading />;
      }
      return <Loading />;
    }
  }

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
