import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import Keycloak from 'keycloak-js';
import hoistNonReactStatics from 'hoist-non-react-statics';

export const AuthGuard = (WrappedComponent) => {
  class AuthGuard extends Component {
    state = {
      keycloak: null,
      authenticatied: false,
    }

    componentDidMount() {
      const keycloak = Keycloak({
        "realm": "mds",
        "auth-server-url": "https://sso-test.pathfinder.gov.bc.ca/auth",
        "ssl-required": "external",
        "resource": "frontend",
        "public-client": true,
        "confidential-port": 0,
        "clientId": "mds"
      });
      keycloak.init({ onLoad: 'login-required' }).then(authenticated => {
        this.setState({ keycloak: keycloak, authenticated: authenticated })
      })
    }

    render() {
      if (!this.state.authenticated) {
        return <div>Unable to login</div>
      } else {
        return (
          <WrappedComponent {...this.props} />
        )
      }
    }
  }

  hoistNonReactStatics(AuthGuard, WrappedComponent);

  return AuthGuard;
};