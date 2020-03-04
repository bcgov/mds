import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import queryString from "query-string";
import hoistNonReactStatics from "hoist-non-react-statics";
import { isAuthenticated } from "@/selectors/authenticationSelectors";
import {
  authenticateUser,
  getUserInfoFromToken,
} from "@/actionCreators/authenticationActionCreator";
import UnauthenticatedNotice from "@/components/common/UnauthenticatedNotice";
import Loading from "@/components/common/Loading";
import * as COMMON_ENV from "@common/constants/environment";
import * as route from "@/constants/routes";

/**
 * @constant authenticationGuard - a Higher Order Component Thats checks for user authorization and returns the App component if the user is Authenticated.
 * CORE/IDIR users are authenticated programmatically when MineSpace mounts,
 */

const propTypes = {
  getUserInfoFromToken: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

export const AuthenticationGuard = (isPublic) => (WrappedComponent) => {
  class authenticationGuard extends Component {
    state = {
      authComplete: false,
    };

    componentDidMount() {
      this.authenticate();
    }

    async authenticate() {
      // get guid from pathname - props.location is not available at this level thus cannot directly access props.match.params.id
      const guid = window.location.pathname
        .split("/mines/")
        .pop()
        .split("/")[0];
      const redirectedFromCore = window.location.search.includes("?core=true");
      const fromCore = localStorage.getItem("fromCore");
      const token = localStorage.getItem("jwt");
      const WINDOW_LOCATION = `${window.location.origin}${process.env.BASE_PATH}`;
      const { code } = queryString.parse(window.location.search);
      const redirectUrl = `${WINDOW_LOCATION}${route.MINE_DASHBOARD.dynamicRoute(guid)}`;

      // all routing from core includes 'core=true', if the user is not authenticated on MineSpace yet, redirect to the Keycloak Login
      if (redirectedFromCore && !code && !token) {
        window.location.replace(`${COMMON_ENV.KEYCLOAK.loginURL}${redirectUrl}`);
      }

      // after successful login, re-direct back to MineSpace with a code, swap code for token and authenticate IDIR user
      // set state in local Storage to persist login flow between redirects
      // value is removed from localStorage after userInfo is obtained
      if (code && !token && !fromCore) {
        localStorage.setItem("fromCore", true);
        await this.props.authenticateUser(code, redirectUrl).then(() => {
          this.setState({ authComplete: true });
        });
      }

      // standard Authentication flow on initial load,
      // if token exists, authenticate user.
      if (token && !this.props.isAuthenticated) {
        await this.props
          .getUserInfoFromToken(token)
          .then(() => this.setState({ authComplete: true }));
      }
    }

    render() {
      const fromCore = localStorage.getItem("fromCore");
      if (fromCore && !this.props.isAuthenticated) {
        return <Loading />;
      }
      if (this.props.isAuthenticated || isPublic) {
        return <WrappedComponent {...this.props} />;
      }
      if (!this.props.isAuthenticated && this.state.authComplete) {
        return <UnauthenticatedNotice />;
      }
      return <Loading />;
    }
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
