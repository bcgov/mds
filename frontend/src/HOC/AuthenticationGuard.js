import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
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

const propTypes = {
  authenticateUser: PropTypes.func.isRequired,
  storeUserAccessData: PropTypes.func.isRequired,
  storeKeycloakData: PropTypes.func.isRequired,
  keycloak: PropTypes.objectOf(PropTypes.any).isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  userAccessData: PropTypes.objectOf(PropTypes.array).isRequired,
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

  class authenticationGuard extends Component {
    componentDidMount() {
      this.keycloakInit();
    }

    async keycloakInit() {
      // Initialize client
      const keycloak = Keycloak(KEYCLOAK);
      await keycloak
        .init({
          onLoad: "login-required",
          idpHint: KEYCLOAK.idpHint,
        })
        .success(() => {
          keycloak.loadUserInfo().success((userInfo) => this.props.authenticateUser(userInfo));
          localStorage.setItem("jwt", keycloak.token);
          this.props.storeUserAccessData(keycloak.realmAccess.roles);
          this.props.storeKeycloakData(keycloak);
        });
    }

    render() {
      if (this.props.keycloak) {
        if (
          this.props.isAuthenticated &&
          this.props.userAccessData.includes(USER_ROLES.role_view)
        ) {
          return <WrappedComponent {...this.props} />;
        }
        if (
          this.props.isAuthenticated &&
          !this.props.userAccessData.includes(USER_ROLES.role_view)
        ) {
          return <NullScreen type="unauthorized" />;
        }
        return <Loading />;
      }
      return <Loading />;
    }
  }

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
      },
      dispatch
    );

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(authenticationGuard);
};

export default AuthenticationGuard;
