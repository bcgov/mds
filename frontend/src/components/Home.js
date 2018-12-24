import React from "react";
import { Layout, BackTop, Button, Icon } from "antd";
import LoadingBar from "react-redux-loading-bar";
import DashboardRoutes from "@/routes/DashboardRoutes";
import { AuthGuard } from "../HOC/AuthGuard";
import NavBar from "./navigation/NavBar";

/**
 * @class Home contains the navigation and wraps the Dashboard routes. Home should not contain any redux logic/state.
 * Home is wrapped in AuthGuard which checks keycloak authorization.
 */

export const Home = () => {
  const { Content } = Layout;
  return (
    <Layout className="layout">
      <div className="header">
        <NavBar />
        <LoadingBar
          style={{
            backgroundColor: "#6b6363",
            position: "fixed",
            top: 55,
            zIndex: 90,
            width: "100%",
            height: "8px",
          }}
        />
      </div>
      <Content className="content">
        <DashboardRoutes />
        <BackTop>
          <Button type="primary">
            <Icon type="arrow-up" theme="outlined" />
          </Button>
        </BackTop>
      </Content>
      <div className="footer" />
    </Layout>
  );
};

export default AuthGuard(Home);
