import React, { Fragment, Component } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { BrowserRouter } from "react-router-dom";
// eslint-disable-next-line
import { hot } from "react-hot-loader";
import { Layout, BackTop, Row, Col, Spin, Icon } from "antd";
import MediaQuery from "react-responsive";
import PropTypes from "prop-types";
import { getStaticContentLoadingIsComplete } from "@common/selectors/staticContentSelectors";
import * as staticContent from "@common/actionCreators/staticContentActionCreator";
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

const propTypes = {
  staticContentLoadingIsComplete: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

class App extends Component {
  state = { isIE: true, isMobile: true };

  componentDidMount() {
    this.setState({ isIE: detectIE() });
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.staticContentLoadingIsComplete) {
      this.loadStaticContent();
    }
  }

  loadStaticContent = () => {
    const staticContentActionCreators = Object.getOwnPropertyNames(staticContent).filter(
      (property) => typeof staticContent[property] === "function"
    );
    staticContentActionCreators.forEach((action) => this.props.dispatch(staticContent[action]()));
  };

  handleMobileWarningClose = () => {
    this.setState({ isMobile: false });
  };

  handleBannerClose = () => {
    this.setState({ isIE: false });
  };

  render() {
    const { Content } = Layout;
    const xs = 24;
    const sm = 22;
    const md = 20;
    const lg = 18;
    return (
      <BrowserRouter basename={process.env.BASE_PATH}>
        <Fragment>
          <Layout>
            <Header xs={xs} sm={sm} md={md} lg={lg} />
            <Layout>
              <Content>
                {this.state.isIE && <WarningBanner type="IE" onClose={this.handleBannerClose} />}
                <MediaQuery maxWidth={500}>
                  {this.state.isMobile && (
                    <WarningBanner type="mobile" onClose={this.handleMobileWarningClose} />
                  )}
                </MediaQuery>
                <Row type="flex" justify="center" align="top">
                  <Col xs={xs} sm={sm} md={md} lg={lg}>
                    <Routes />
                  </Col>
                </Row>
                <ModalWrapper />
                <BackTop />
              </Content>
            </Layout>
            <Footer xs={xs} sm={sm} md={md} lg={lg} />
          </Layout>
        </Fragment>
      </BrowserRouter>
    );
  }
}

App.propTypes = propTypes;

const mapStateToProps = (state) => ({
  staticContentLoadingIsComplete: getStaticContentLoadingIsComplete(state),
});

export default compose(connect(mapStateToProps), hot(module), AuthenticationGuard(true))(App);
