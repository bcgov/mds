import React, { Fragment, Component } from "react";
import { compose } from "redux";
import { BrowserRouter } from "react-router-dom";
// eslint-disable-next-line
import { hot } from "react-hot-loader";
import { Layout, BackTop, Row, Col, Spin, Icon } from "antd";
import MediaQuery from "react-responsive";
import Routes from "./routes/Routes";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ModalWrapper from "@/components/common/wrappers/ModalWrapper";
import AuthenticationGuard from "@/HOC/AuthenticationGuard";
import WarningBanner from "@/components/common/WarningBanner";
import { detectIE } from "@/utils/environmentUtils";
import configureStore from "./store/configureStore";

export const store = configureStore();

Spin.setDefaultIndicator(<Icon type="loading" style={{ fontSize: 40 }} />);

class App extends Component {
  state = { isIE: true, isMobile: true };

  componentDidMount() {
    this.setState({ isIE: detectIE() });
  }

  handleMobileWarningClose = () => {
    this.setState({ isMobile: false });
  };

  handleBannerClose = () => {
    this.setState({ isIE: false });
  };

  render() {
    const { Content } = Layout;
    return (
      <BrowserRouter basename={process.env.BASE_PATH}>
        <Fragment>
          <Layout>
            <Header />
            <Layout>
              <Content>
                {this.state.isIE && <WarningBanner type="IE" onClose={this.handleBannerClose} />}
                <MediaQuery maxWidth={500}>
                  {this.state.isMobile && (
                    <WarningBanner type="mobile" onClose={this.handleMobileWarningClose} />
                  )}
                </MediaQuery>
                <Row type="flex" justify="center" align="top">
                  <Col xs={24} sm={22} md={20} lg={16}>
                    <Routes />
                  </Col>
                </Row>
                <ModalWrapper />
                <BackTop />
              </Content>
            </Layout>
            <Footer />
          </Layout>
        </Fragment>
      </BrowserRouter>
    );
  }
}

export default compose(hot(module), AuthenticationGuard(true))(App);
