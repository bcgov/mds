import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Keycloak from "keycloak-js";
import hoistNonReactStatics from "hoist-non-react-statics";
import {
  isAuthenticated,
  getKeycloak,
  getUserAccessData,
} from "@/selectors/authenticationSelectors";
import {
  authenticateUser,
  storeKeycloakData,
  storeUserAccessData,
} from "@/actions/authenticationActions";
import Loading from "@/components/common/Loading";
import { KEYCLOAK, USER_ROLES } from "@/constants/environment";
import NullScreen from "@/components/common/NullScreen";

/**
 * @constant AuthGuard - a Higher Order Component Thats checks for user authorization and returns the App component if the user is Authenticated.
 */

export const AuthGuard = (WrappedComponent) => {
  /**
   * Initializes the KeyCloak client and enables
   * redirects directly to IDIR login page.
   *
   * The method uses async/awaits instead of promises
   * because we were facing troubles with promise resolving
   * and changing state.
   *
   */
  class AuthGuard extends Component {
    async keycloakInit() {
      // Initialize client
      const keycloak = Keycloak(KEYCLOAK);
      await keycloak.init();

      // Prompt for login using IDIR if not authenticated
      if (!keycloak.authenticated) {
        await keycloak.login({ idpHint: KEYCLOAK.idpHint });
      }

      // Fetch user info and roles and store them in local storage
      const userInfo = await keycloak.loadUserInfo();
      localStorage.setItem("jwt", keycloak.token);
      this.props.storeUserAccessData(keycloak.realmAccess.roles);
      this.props.storeKeycloakData(keycloak);
      this.props.authenticateUser(userInfo);
      // return;
    }

    componentDidMount() {
      this.keycloakInit();
    }

    render() {
      if (this.props.keycloak) {
        if (
          this.props.isAuthenticated &&
          this.props.userAccessData.includes(USER_ROLES.role_view)
        ) {
          return <WrappedComponent {...this.props} />;
        } else if (
          this.props.isAuthenticated &&
          !this.props.userAccessData.includes(USER_ROLES.role_view)
        ) {
          return <NullScreen type="unauthorized" />;
        } else {
          return <Loading />;
        }
      }
      return <Loading />;
    }
  }

  hoistNonReactStatics(AuthGuard, WrappedComponent);

  const mapStateToProps = (state) => {
    return {
      isAuthenticated: isAuthenticated(state),
      userAccessData: getUserAccessData(state),
      keycloak: getKeycloak(state),
    };
  };

  const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(
      {
        authenticateUser,
        storeUserAccessData,
        storeKeycloakData,
      },
      dispatch
    );
  };

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(AuthGuard);
};
