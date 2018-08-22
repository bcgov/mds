/**
 * @class Home contains the navigation and wraps the Dashboard routes. Home should not contain any redux logic/state. 
 * Home is wrapped in AuthGuard which checks keycloak authorization.
 */

import React, { Component } from 'react';
import { Layout } from 'antd';
import LoadingBar from 'react-redux-loading-bar'

import DashboardRoutes from '@/routes/DashboardRoutes';
import { AuthGuard } from '../HOC/AuthGuard';
import NavBar from './navigation/NavBar';


export class Home extends Component {
  render() {
    const { Content } = Layout;
    return (
      <Layout>
        <NavBar />
        <LoadingBar style={{ backgroundColor: 'blue', position: 'fixed', top: 64, zIndex: 100, width: '100%' }} />
        <Content>
          <DashboardRoutes
           />
        </Content>
      </Layout>
    );
  }
}

export default AuthGuard(Home);
