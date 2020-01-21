import React, { Fragment, Component } from "react";
import { compose } from "redux";
import { BrowserRouter } from "react-router-dom";
// eslint-disable-next-line
import { hot } from "react-hot-loader";
import { Layout, BackTop } from "antd";
import MediaQuery from "react-responsive";
import Routes from "./routes/Routes";
import { HeaderContent } from "@/components/HeaderContent";
import { FooterContent } from "@/components/FooterContent";
import ModalWrapper from "@/components/common/wrappers/ModalWrapper";
import AuthenticationGuard from "@/HOC/AuthenticationGuard";
import WarningBanner from "@/components/common/WarningBanner";
import { detectIE } from "@/utils/environmentUtils";
import configureStore from "./store/configureStore";

export const store = configureStore();

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
    const { Header, Footer, Content } = Layout;
    return (
      <BrowserRouter basename={process.env.BASE_PATH}>
        <Fragment>
          <Layout>
            <Header>
              <HeaderContent />
            </Header>
            {this.state.isIE && <WarningBanner type="IE" onClose={this.handleBannerClose} />}
            <MediaQuery maxWidth={500}>
              {this.state.isMobile && (
                <WarningBanner type="mobile" onClose={this.handleMobileWarningClose} />
              )}
            </MediaQuery>
            <Content>
              <Routes />
              <ModalWrapper />
              <BackTop />
            </Content>
            <Footer>
              <FooterContent />
            </Footer>
          </Layout>
        </Fragment>
      </BrowserRouter>
    );
  }
}

export default compose(hot(module), AuthenticationGuard(true))(App);
