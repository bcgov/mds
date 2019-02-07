import React, { Fragment, Component } from "react";
import { compose } from "redux";
import { BrowserRouter } from "react-router-dom";
import { hot } from "react-hot-loader";
import { Layout, BackTop, Button, Icon } from "antd";
import Routes from "./routes/Routes";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ModalWrapper from "@/components/common/wrappers/ModalWrapper";
import AuthenticationGuard from "@/HOC/AuthenticationGuard";
import WarningBanner from "@/components/common/WarningBanner";
import { detectIE } from "@/utils/environmentUtils";

class App extends Component {
  state = { isIE: true };

  componentDidMount() {
    this.setState({ isIE: detectIE() });
  }

  handleBannerClose = () => {
    this.setState({ isIE: false });
  };

  render() {
    const { Content } = Layout;
    return (
      <BrowserRouter basename={process.env.BASE_PATH}>
        <Fragment>
          <Layout className="layout">
            <Header />
            {this.state.isIE && <WarningBanner onClose={this.handleBannerClose} />}
            <Content className="content">
              <Routes />
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
  }
}

export default compose(
  hot(module),
  AuthenticationGuard(true) // isPublic === true
)(App);
