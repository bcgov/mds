/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { includes } from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import queryString from "query-string";
import hoistNonReactStatics from "hoist-non-react-statics";
import { isAuthenticated } from "@/selectors/authenticationSelectors";
import { authenticateUser } from "@/actionCreators/authenticationActionCreator";
import UnauthenticatedNotice from "@/components/common/UnauthenticatedNotice";
import { getUserInfoFromToken } from "@/actionCreators/authenticationActionCreator";
import Loading from "@/components/common/Loading";
import * as COMMON_ENV from "@common/constants/environment";
import * as route from "@/constants/routes";
import * as MINESPACE_ENV from "@/constants/environment";

/**
 * @constant authenticationGuard - a Higher Order Component Thats checks for user authorization and returns the App component if the user is Authenticated.
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
      console.log(window.location);
      console.log(window.location.pathname);
      console.log(window.location.search.includes("?core=true"));
      const WINDOW_LOCATION = `${window.location.origin}${process.env.BASE_PATH}`;

      const { code } = queryString.parse(window.location.search);
      if (window.location.search.includes("code=")) {
        console.log(code);
        console.log("yesssss it does have the code!!");
        const redirectUrl = `${WINDOW_LOCATION}${window.location.pathname}`;
        this.props.authenticateUser(code, redirectUrl);
      }

      this.authenticate();
    }

    async authenticate() {
      const redirectedFromCore = window.location.search.includes("?core=true");
      const token = localStorage.getItem("jwt");
      const WINDOW_LOCATION = `${window.location.origin}${process.env.BASE_PATH}`;

      if (!token && !this.props.isAuthenticated && redirectedFromCore) {
        console.log("COMING FROM CORE AND NOT AUTHENTICATED");
        // debugger;
        window.location.replace(
          `${COMMON_ENV.KEYCLOAK.loginURL}${WINDOW_LOCATION}${window.location.pathname}`
        );
      }

      if (token && !this.props.isAuthenticated) {
        await this.props
          .getUserInfoFromToken(token)
          .then(() => this.setState({ authComplete: true }));
      } else {
        this.setState({ authComplete: true });
      }
    }

    render() {
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
