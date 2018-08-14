import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Keycloak from 'keycloak-js';
import hoistNonReactStatics from 'hoist-non-react-statics';

import { isAuthenticated, getKeycloak } from '@/selectors/authenticationSelectors';
import { authenticateUser, storeKeycloakData } from '@/actions/authenticationActions';
import  Loading  from '@/components/reusables/Loading';
import { KEYCLOAK } from '@/constants/environment';

export const AuthGuard = (WrappedComponent) => {
  class AuthGuard extends Component {
    componentDidMount() {
      const keycloak = Keycloak(KEYCLOAK);
      keycloak.init({ onLoad: 'login-required'}).then(() => {
        keycloak.loadUserInfo().then((userInfo) => {
          localStorage.setItem('jwt', keycloak.token);
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
          return (<Loading />)
        }
      }
      return (<Loading />)
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