import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import Keycloak from 'keycloak-js';
import hoistNonReactStatics from 'hoist-non-react-statics';

import { isAuthenticated, getKeycloak } from '@/selectors/authenticationSelectors';
import { authenticateUser, storeKeycloakData } from '@/actions/authenticationActions';
import { KEYCLOAK } from '@/constants/keycloak';

export const AuthGuard = (WrappedComponent) => {
  class AuthGuard extends Component {
    componentDidMount() {
      const keycloak = Keycloak(KEYCLOAK);
      keycloak.init({ onLoad: 'login-required' }).then(() => {
        keycloak.loadUserInfo().then((userInfo) => {
          this.props.authenticateUser(userInfo);
          this.props.storeKeycloakData(keycloak);
        })
      })
    }

    render() {
      if (this.props.keycloak) {
        if (this.props.isAuthenticated) {
          return (
            <WrappedComponent {...this.props} />
          ); 
        } else {
          return (<div>Authenticating..</div>)
        } 
      }
      return (<div>Loading...</div>)
    }
  }

  hoistNonReactStatics(AuthGuard, WrappedComponent);

  const mapStateToProps = (state) => {
    return {
      isAuthenticated: isAuthenticated(state),
      keycloak: getKeycloak(state)
    };
  };

  const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
      authenticateUser,
      storeKeycloakData
    }, dispatch);
  };

  return connect(mapStateToProps, mapDispatchToProps)(AuthGuard);
};