/**
 * @class Home contains the navigation and wraps the Dashboard routes. Home should not contain any redux logic/state. 
 * Home is wrapped in AuthGuard which checks keycloak authorization.
 */

import React, { Component } from 'react';
import { Layout } from 'antd';

import DashboardRoutes from '@/routes/DashboardRoutes';
import { AuthGuard } from '../HOC/AuthGuard';
import NavBar from './navigation/NavBar';


class Home extends Component {
  render() {
    const { Content } = Layout;
    return (
      <Layout>
        <NavBar />
        <Content>
          <DashboardRoutes />
        </Content>
      </Layout>
    );
  }
}

export default AuthGuard(Home);
