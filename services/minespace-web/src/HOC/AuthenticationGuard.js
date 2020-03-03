/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { includes } from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import queryString from "query-string";
import hoistNonReactStatics from "hoist-non-react-statics";
import { isAuthenticated } from "@/selectors/authenticationSelectors";
import {
  authenticateUser,
  authenticateCoreUser,
  getUserInfoFromToken,
} from "@/actionCreators/authenticationActionCreator";
import UnauthenticatedNotice from "@/components/common/UnauthenticatedNotice";
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
      attemptOne: false,
    };

    componentDidMount() {
      this.authenticate();
    }

    async authenticate() {
      const redirectedFromCore = window.location.search.includes("?core=true");
      const token = localStorage.getItem("jwt");
      const WINDOW_LOCATION = `${window.location.origin}${process.env.BASE_PATH}`;
      const { code, type } = queryString.parse(window.location.search);
      const search = queryString.parse(window.location.search);
      const redirectUrl = `${WINDOW_LOCATION}${window.location.pathname}`;

      // if (redirectedFromCore) {
      //   if (code && !token && !this.state.attemptOne) {
      //     console.log("RETURNED FROM KEYCLOAK WITH THE CODE: REDIRECTING TO AUTHENTICATEUSER");
      //     console.log(search);
      //     console.log(code);
      //     this.setState({ attemptOne: true }, () => {
      //       this.props
      //         .authenticateUser(code, redirectUrl)
      //         .then((res) => {
      //           console.log(res);
      //           console.log("waiting for this to resolve");
      //           this.setState({ authComplete: true });
      //         })
      //         .catch((err) => {
      //           // debugger;
      //           console.log("catching error");
      //           console.log(err);
      //         });
      //     });
      //   } else if (!code && !token) {
      //     console.log("REDIRECTED FROM CORE INITIALLY: REDIRECTING TO KEYCLOAK LOGIN");
      //     window.location.replace(
      //       `${COMMON_ENV.KEYCLOAK.loginURL}${WINDOW_LOCATION}${window.location.pathname}?core=true`
      //     );
      //   }
      // }

      if (code && !token && !this.state.attemptOne) {
        console.log("RETURNED FROM KEYCLOAK WITH THE CODE: REDIRECTING TO AUTHENTICATEUSER");
        console.log(search);
        console.log(code);
        this.setState({ attemptOne: true }, () => {
          return this.props
            .authenticateCoreUser(code, redirectUrl)
            .then((res) => {
              console.log(res);
              console.log("waiting for this to resolve");
              this.setState({ authComplete: true });
            })
            .catch((err) => {
              // debugger;
              console.log("catching error");
              console.log(err);
            });
        });
      }
      // if (code && !token) {
      //   this.props
      //     .authenticateUser(code, redirectUrl)
      //     .then((res) => {
      //       console.log(res);
      //       console.log("waiting for this to resolve");
      //       this.setState({ authComplete: true });
      //     })
      //     .catch((err) => {
      //       // debugger;
      //       console.log("catching error");
      //       console.log(err);
      //     });
      // }

      if (redirectedFromCore && !code) {
        console.log("REDIRECTED FROM CORE INITIALLY: REDIRECTING TO KEYCLOAK LOGIN");
        window.location.replace(
          `${COMMON_ENV.KEYCLOAK.loginURL}${WINDOW_LOCATION}${window.location.pathname}`
        );
      }

      // if (
      //   window.location.search.includes("code=") &&
      //   window.location.search.includes("?core=true")
      // ) {
      //   console.log(code);
      //   console.log(search);
      //   console.log("yesssss it does have the code!!");
      //   const redirectUrl = `${WINDOW_LOCATION}${window.location.pathname}`;
      //   this.props.authenticateUser(code, redirectUrl).then(() => {
      //     this.setState({ authComplete: true });
      //   });
      // }

      if (token && !this.props.isAuthenticated && !redirectedFromCore) {
        console.log("I SHOULDN'T BE HERE WHY AM I HERE??");
        console.log("WAIT AM I GETTING CALLED??");
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
        authenticateCoreUser,
      },
      dispatch
    );

  return connect(mapStateToProps, mapDispatchToProps)(authenticationGuard);
};

AuthenticationGuard.propTypes = propTypes;

export default AuthenticationGuard;
