import React, { Fragment, Component } from "react";
import { compose } from "redux";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { BrowserRouter } from "react-router-dom";
// eslint-disable-next-line
import { hot } from "react-hot-loader";
import { LoadingOutlined } from "@ant-design/icons";
import { Layout, BackTop, Row, Col, Spin } from "antd";
import { loadBulkStaticContent } from "@common/actionCreators/staticContentActionCreator";
import { isAuthenticated } from "@/selectors/authenticationSelectors";
import { getStaticContentLoadingIsComplete } from "@common/selectors/staticContentSelectors";
import MediaQuery from "react-responsive";
import Routes from "./routes/Routes";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ModalWrapper from "@/components/common/wrappers/ModalWrapper";
import DocumentViewer from "@/components/syncfusion/DocumentViewer";
import AuthenticationGuard from "@/HOC/AuthenticationGuard";
import WarningBanner from "@/components/common/WarningBanner";
import { detectIE } from "@/utils/environmentUtils";
import configureStore from "./store/configureStore";
import { MatomoLinkTracing } from "../common/utils/trackers";

export const store = configureStore();

Spin.setDefaultIndicator(<LoadingOutlined style={{ fontSize: 40 }} />);

class App extends Component {
  state = { isIE: true, isMobile: true };

  componentDidMount() {
    if (this.props.isAuthenticated) {
      this.props.loadBulkStaticContent();
    }
    this.setState({ isIE: detectIE() });
  }

  componentDidUpdate(nextProps) {
    const authChanged =
      nextProps.isAuthenticated !== this.props.isAuthenticated || nextProps.isAuthenticated;
    if (authChanged && !nextProps.staticContentLoadingIsComplete) {
      this.props.loadBulkStaticContent();
    }
  }

  handleMobileWarningClose = () => {
    this.setState({ isMobile: false });
  };

  handleBannerClose = () => {
    this.setState({ isIE: false });
  };

  render() {
    const xs = 24;
    const lg = 22;
    const xl = 20;
    const xxl = 18;
    return (
      <BrowserRouter basename={process.env.BASE_PATH}>
        <Fragment>
          <MatomoLinkTracing />
          <Layout>
            <Header xs={xs} lg={lg} xl={xl} xxl={xxl} />
            <Layout>
              <Layout.Content>
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
                <DocumentViewer />
                <BackTop />
              </Layout.Content>
            </Layout>
            <Footer xs={xs} lg={lg} xl={xl} xxl={xxl} />
          </Layout>
        </Fragment>
      </BrowserRouter>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: isAuthenticated(state),
  staticContentLoadingIsComplete: getStaticContentLoadingIsComplete(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      loadBulkStaticContent,
    },
    dispatch
  );

export default compose(
  hot(module),
  connect(mapStateToProps, mapDispatchToProps),
  AuthenticationGuard(true)
)(App);
