import React, { Fragment } from "react";
import { BrowserRouter } from "react-router-dom";
import { hot } from "react-hot-loader";
import { Layout, BackTop, Button, Icon } from "antd";
import Routes from "./routes/Routes";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import DashboardRoutes from "./routes/DashboardRoutes";

const App = () => {
  const { Content } = Layout;
  return (
    <BrowserRouter basename={process.env.BASE_PATH}>
      <Fragment>
        <Layout className="layout">
          <Header />
          <Content className="content">
            <DashboardRoutes />
            <Routes />
            <BackTop>
              <Button type="primary">
                <Icon type="arrow-up" theme="outlined" />
              </Button>
            </BackTop>
          </Content>
          <Footer />
        </Layout>
      </Fragment>
    </BrowserRouter>
  );
};

export default hot(module)(App);
