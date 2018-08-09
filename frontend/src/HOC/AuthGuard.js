import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import Keycloak from 'keycloak-js';
import hoistNonReactStatics from 'hoist-non-react-statics';

export const AuthGuard = (WrappedComponent) => {
  class AuthGuard extends Component {
    constructor(props) {
      super(props);
      this.state = {
        keycloak: null,
        authenticated: false
      };
    }
    componentDidMount() {
      const keycloak = Keycloak({
        "realm": "mds",
        "url": "https://sso-test.pathfinder.gov.bc.ca/auth/",
        "ssl-required": "external",
        "resource": "frontend",
        "public-client": true,
        "confidential-port": 0,
        "clientId": "frontend"
      });
      keycloak.init({ onLoad: 'login-required' }).then((authenticated) => {
        this.setState({ keycloak: keycloak, authenticated: authenticated });
      })
    }

    render() {
      if (this.state.keycloak) {
        if (this.state.authenticated)
          return (
          <WrappedComponent {...this.props} />
        ); 
        else return (<div>Unable to authenticate!</div>)
      }
      return (
        <div>Initializing Keycloak...</div>
      );
    }
  }

  hoistNonReactStatics(AuthGuard, WrappedComponent);

  return AuthGuard;
};