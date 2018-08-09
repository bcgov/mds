import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { Layout, Menu, Breadcrumb } from 'antd';
import { connect } from 'react-redux';
import Keycloak from 'keycloak-js';
import { Link } from 'react-router-dom';

import { createMineRecord } from '@/actionCreators/mineActionCreator';
import * as router from '@/constants/routes';
import DashboardRoutes from '@/routes/DashboardRoutes';
// import { AuthGuard } from '../../HOC/AuthGuard';


class Dashboard extends Component {
  // constructor(props) {
  //   super(props);
  //   this.state = { keycloak: null, authenticated: false };
  // }
  // componentDidMount() {
  //   const keycloak = Keycloak({
  //     "realm": "mds",
  //     "auth-server-url": "https://sso-test.pathfinder.gov.bc.ca/auth",
  //     "ssl-required": "external",
  //     "resource": "frontend",
  //     "public-client": true,
  //     "confidential-port": 0,
  //     "clientId": "frontend"
  //   });
  //   keycloak.init({ onLoad: 'login-required' }).then(authenticated => {
  //     this.setState({ keycloak: keycloak, authenticated: authenticated })
  //   })
  // }
  render() {
    const { Header, Content, Footer } = Layout;
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

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    createMineRecord
  }, dispatch);
}

export default connect(null, mapDispatchToProps)(Dashboard);
