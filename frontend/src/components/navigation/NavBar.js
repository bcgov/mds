import React, { Component } from 'react';
import {  Layout, Menu, Icon, Dropdown } from 'antd';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { getUserInfo } from '@/selectors/authenticationSelectors';
import * as router from '@/constants/routes';
import { HOME, PROFILE } from '@/constants/assets';
import Logout from '../authentication/Logout';

const propTypes = {
  userInfo: PropTypes.object,
};

const defaultProps = {
  userInfo: {},
};

export class NavBar extends Component {
  render() {
    return (
      <div className="menu">
        <Link to={router.MINE_DASHBOARD.dynamicRoute('1', '5')}>
          <img className="menu__img" src={HOME} />
        </Link>
        <Dropdown overlay={<Logout />}>
          <a className="menu__dropdown-link" href="#">
            <img className="menu__img" src={PROFILE} />
            {this.props.userInfo.preferred_username}
            <Icon type="down" />
          </a>
        </Dropdown>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    userInfo: getUserInfo(state)
  };
};

NavBar.propTypes = propTypes;
NavBar.defaultProps = defaultProps;

export default connect(mapStateToProps, null)(NavBar);
