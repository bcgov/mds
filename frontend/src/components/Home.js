/**
 * @class Home contains the navigation and wraps the Dashboard routes. Home should not contain any redux logic/state. 
 * Home is wrapped in AuthGuard which checks keycloak authorization.
 */

import React, { Component } from 'react';
import { Layout, BackTop, Button } from 'antd';
import LoadingBar from 'react-redux-loading-bar'

import DashboardRoutes from '@/routes/DashboardRoutes';
import { AuthGuard } from '../HOC/AuthGuard';
import NavBar from './navigation/NavBar';


export class Home extends Component {
  render() {
    const { Content } = Layout;
    return (
      <Layout className="layout">
        <div className="header">
          <NavBar />
          <LoadingBar style={{ backgroundColor: '#B9ADA2', position: 'fixed', top: 55, zIndex: 100, width: '100%', height: '8px'}} />
        </div>
        <Content className="content">
          <DashboardRoutes />
          <BackTop>
            <Button type="primary">Back To Top</Button>
          </BackTop>
        </Content>
        <div className="footer" ></div>
      </Layout>
    );
  }
}

export default AuthGuard(Home);
