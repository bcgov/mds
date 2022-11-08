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
import * as COMMON_ENV from "@mds/common";
import * as route from "@/constants/routes";
import * as ENV from "@/constants/environment";

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
      const authenticatingFromCoreFlag = localStorage.getItem("authenticatingFromCoreFlag");
      const token = localStorage.getItem("jwt");
      const { code, type, redirectingFromCore } = queryString.parse(window.location.search);
      const redirectUrl = `${ENV.WINDOW_LOCATION}${route.MINE_DASHBOARD.dynamicRoute(guid)}`;

      // all routing from core includes 'redirectingFromCore=true', if the user is not authenticated on MineSpace yet, redirect to the Keycloak Login
      if (redirectingFromCore && !token) {
        window.location.replace(`${COMMON_ENV.KEYCLOAK.loginURL}${redirectUrl}`);
      }

      // after successful login, re-direct back to MineSpace with a code, swap code for token and authenticate IDIR user
      // set state in local Storage to persist login flow between redirects
      // value is removed from localStorage after userInfo is obtained
      // if type=true, Login is occurring through standard flow, bypass this block
      if (code && !token && !authenticatingFromCoreFlag && !type) {
        localStorage.setItem("authenticatingFromCoreFlag", true);
        await this.props
          .authenticateUser(code, redirectUrl)
          .then(() => {
            // remove session_state/code params from the url after successful authentication
            window.history.replaceState(null, null, window.location.pathname);
            this.setState({ authComplete: true });
          })
          .catch(() => {
            localStorage.removeItem("authenticatingFromCoreFlag");
          });
      }

      // standard Authentication flow on initial load,
      // if token exists, authenticate user.
      if (token && !this.props.isAuthenticated) {
        await this.props
          .getUserInfoFromToken(token)
          .then(() => this.setState({ authComplete: true }));
      } else {
        this.setState({ authComplete: true });
      }
    }

    render() {
      const { redirectingFromCore } = queryString.parse(window.location.search);
      const authenticatingFromCoreFlag = localStorage.getItem("authenticatingFromCoreFlag");
      const fromCore = !redirectingFromCore && !authenticatingFromCoreFlag;
      if (this.props.isAuthenticated || isPublic) {
        return <WrappedComponent {...this.props} />;
      }
      if (!this.props.isAuthenticated && this.state.authComplete && fromCore) {
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
