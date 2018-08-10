import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { Button } from 'antd';
import { connect } from 'react-redux';
import Keycloak from 'keycloak-js';

import { logoutUser } from '@/actions/authenticationActions';
import { getKeycloak } from '@/selectors/authenticationSelectors';



class Logout extends Component {
  handleLogout(event) {
    this.props.keycloak.logout();
    localStorage.removeItem('jwt');
    this.props.logoutUser();
  }

  render() {
    return (
      <Button type="primary" onClick={(event) => this.handleLogout()}>Logout</Button>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    keycloak: getKeycloak(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    logoutUser
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Logout);