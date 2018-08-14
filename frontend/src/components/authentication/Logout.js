/**
 * @class Logout.js is a small component which contains all keycloak logic to log a user out, NOTE: due to idir issues, Logout does not work as it should.
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { Button } from 'antd';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { logoutUser } from '@/actions/authenticationActions';
import { getKeycloak } from '@/selectors/authenticationSelectors';

const propTypes = {
  logoutUser: PropTypes.func.isRequired,
  keycloak: PropTypes.object.isRequired,
};

const defaultProps = {
  keycloak: {},
};

class Logout extends Component {
  handleLogout = (event) => {
    this.props.keycloak.logout();
    localStorage.removeItem('jwt');
    this.props.logoutUser();
  }

  render() {
    return (
      <Button type="primary" onClick={this.handleLogout}>Logout</Button>
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


Logout.propTypes = propTypes;
Logout.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(Logout);
