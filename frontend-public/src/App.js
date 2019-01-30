import React, { Fragment } from "react";
import { compose } from "redux";
import { BrowserRouter } from "react-router-dom";
import { hot } from "react-hot-loader";
import { Layout, BackTop, Button, Icon } from "antd";
import PublicRoutes from "./routes/PublicRoutes";
import PrivateRoutes from "./routes/PrivateRoutes";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ModalWrapper from "@/components/common/wrappers/ModalWrapper";
import AuthenticationGuard from "@/HOC/AuthenticationGuard";

const App = () => {
  const { Content } = Layout;
  return (
    <BrowserRouter basename={process.env.BASE_PATH}>
      <Fragment>
        <Layout className="layout">
          <Header />
          <Content className="content">
            <PrivateRoutes />
            <PublicRoutes />
            <ModalWrapper />
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

export default compose(
  hot(module),
  AuthenticationGuard(true) // isPublic === true
)(App);
