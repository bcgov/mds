import React, { Fragment, Component } from "react";
import { compose } from "redux";
import { BrowserRouter } from "react-router-dom";
// eslint-disable-next-line
import { hot } from "react-hot-loader";
import { Layout, BackTop, Row, Col, Spin, Icon } from "antd";
import MediaQuery from "react-responsive";
import Routes from "./routes/Routes";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
    const xs = 24;
    const lg = 22;
    const xl = 20;
    const xxl = 18;
    return (
      <BrowserRouter basename={process.env.BASE_PATH}>
        <Fragment>
          <Layout>
            <Header xs={xs} lg={lg} xl={xl} xxl={xxl} />
            <Layout>
              <Content>
                {this.state.isIE && <WarningBanner type="IE" onClose={this.handleBannerClose} />}
                <MediaQuery maxWidth={500}>
                  {this.state.isMobile && (
                    <WarningBanner type="mobile" onClose={this.handleMobileWarningClose} />
                  )}
                </MediaQuery>
                <Row type="flex" justify="center" align="top">
                  <Col xs={xs} lg={lg} xl={xl} xxl={xxl}>
                    <Routes />
                  </Col>
                </Row>
                <ModalWrapper />
                <BackTop />
              </Content>
            </Layout>
            <Footer xs={xs} lg={lg} xl={xl} xxl={xxl} />
          </Layout>
        </Fragment>
      </BrowserRouter>
    );
  }
}

export default compose(hot(module), AuthenticationGuard(true))(App);
