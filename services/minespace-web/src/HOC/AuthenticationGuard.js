/* eslint-disable */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import hoistNonReactStatics from "hoist-non-react-statics";
import { isAuthenticated } from "@/selectors/authenticationSelectors";
import UnauthorizedNotice from "@/components/common/UnauthorizedNotice";
import { getUserInfoFromToken } from "@/actionCreators/authenticationActionCreator";

/**
 * @constant authenticationGuard - a Higher Order Component Thats checks for user authorization and returns the App component if the user is Authenticated.
 */

const propTypes = {
  getUserInfoFromToken: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

export const AuthenticationGuard = (isPublic) => (WrappedComponent) => {
  class authenticationGuard extends Component {
    componentDidMount() {
      const token = localStorage.getItem("jwt");
      if (token && !this.props.isAuthenticated) {
        this.props.getUserInfoFromToken(token).catch(() => {
          // Silently fail
        });
      }
    }

    render() {
      if (this.props.isAuthenticated || isPublic) {
        return <WrappedComponent {...this.props} />;
      }
      return <UnauthorizedNotice />;
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
      },
      dispatch
    );

  return connect(mapStateToProps, mapDispatchToProps)(authenticationGuard);
};

AuthenticationGuard.propTypes = propTypes;

export default AuthenticationGuard;
