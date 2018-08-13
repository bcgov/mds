import React, { Component } from 'react';
import {  Layout, Menu } from 'antd';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { getUserInfo } from '@/selectors/authenticationSelectors';
import * as router from '@/constants/routes';
import Logout from '../authentication/Logout';


class NavBar extends Component {
  render() {
    const { Header } = Layout;
    return (
      <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['1']}
        >
          <Menu.Item key="1"><Link to={router.MINE_DASHBOARD.route}>Home</Link></Menu.Item>
          <Menu.Item key="2">Logged in as: {this.props.userInfo.preferred_username}</Menu.Item>
          <Menu.Item key="3"><Logout /></Menu.Item>
        </Menu>
      </Header>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    userInfo: getUserInfo(state)
  };
};


export default connect(mapStateToProps, null)(NavBar);
