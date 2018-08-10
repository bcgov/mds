import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { Layout, Menu, Breadcrumb } from 'antd';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { createMineRecord } from '@/actionCreators/mineActionCreator';
import { getUserInfo } from '@/selectors/authenticationSelectors';
import * as router from '@/constants/routes';
import DashboardRoutes from '@/routes/DashboardRoutes';
import { AuthGuard } from '../../HOC/AuthGuard';
import Logout from '../authentication/Logout';


class Dashboard extends Component {
  render() {
    const { Header, Content } = Layout;
    return (
      <Layout style={{ height: '100vh' }}>
        <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['1']}
            style={{ lineHeight: '63px' }}
          >
            <Menu.Item key="1"><Link to={router.MINE_DASHBOARD.route}>Home</Link></Menu.Item>
            <Menu.Item key="2">Logged in as: {this.props.userInfo.preferred_username}</Menu.Item>
            <Menu.Item key="3"><Logout /></Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: '0 50px', marginTop: 64 }}>
          <div style={{ background: '#fff', padding: 24, minHeight: 380 }}>
            <DashboardRoutes />
          </div>
        </Content>
      </Layout>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    userInfo: getUserInfo(state)
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    createMineRecord
  }, dispatch);
}

export default AuthGuard(connect(mapStateToProps, mapDispatchToProps)(Dashboard));
