import React, { FC, useEffect, useState } from "react";
import { compose, bindActionCreators } from "redux";
import { connect } from "react-redux";
import { BrowserRouter } from "react-router-dom";
// eslint-disable-next-line
import { hot } from "react-hot-loader";
import { LoadingOutlined } from "@ant-design/icons";
import { Layout, BackTop, Row, Col, Spin } from "antd";
import { loadBulkStaticContent } from "@common/actionCreators/staticContentActionCreator";
import { getStaticContentLoadingIsComplete } from "@common/selectors/staticContentSelectors";
import MediaQuery from "react-responsive";
import * as PropTypes from "prop-types";
import { isAuthenticated } from "@/selectors/authenticationSelectors";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ModalWrapper from "@/components/common/wrappers/ModalWrapper";
import DocumentViewer from "@/components/syncfusion/DocumentViewer";
import AuthenticationGuard from "@/HOC/AuthenticationGuard";
import WarningBanner from "@/components/common/WarningBanner";
import { detectIE } from "@mds/common";
import Routes from "./routes/Routes";
import configureStore from "./store/configureStore";

export const store = configureStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

Spin.setDefaultIndicator(<LoadingOutlined style={{ fontSize: 40 }} />);

const propTypes = {
  loadBulkStaticContent: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
  staticContentLoadingIsComplete: PropTypes.bool,
};

const defaultProps = {
  isAuthenticated: false,
  staticContentLoadingIsComplete: false,
};

interface AppProps {
  isAuthenticated: boolean;
  staticContentLoadingIsComplete: boolean;
  loadBulkStaticContent: () => void;
}

const App: FC<AppProps> = (props) => {
  const [isIE, setIsIE] = useState(true);
  const [isMobile, setIsMobile] = useState(true);

  const { loadBulkStaticContent, isAuthenticated, staticContentLoadingIsComplete } = props;

  useEffect(() => {
    if (isAuthenticated) {
      loadBulkStaticContent();
    }
    setIsIE(!!detectIE());
  }, []);

  useEffect(() => {
    if (isAuthenticated && !staticContentLoadingIsComplete) {
      loadBulkStaticContent();
    }
  }, [isAuthenticated]);

  const handleMobileWarningClose = () => {
    setIsMobile(false);
  };

  const handleBannerClose = () => {
    setIsIE(false);
  };

  const xs = 24;
  const lg = 22;
  const xl = 20;
  const xxl = 18;
  return (
    <BrowserRouter basename={process.env.BASE_PATH}>
      <>
        <Layout>
          <Header xs={xs} lg={lg} xl={xl} xxl={xxl} isAuthenticated={isAuthenticated} />
          <Layout>
            <Layout.Content>
              {isIE && <WarningBanner type="IE" onClose={handleBannerClose} />}
              <MediaQuery maxWidth={500}>
                {isMobile && <WarningBanner type="mobile" onClose={handleMobileWarningClose} />}
              </MediaQuery>
              <Row justify="center" align="top">
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
      </>
    </BrowserRouter>
  );
};

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

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default compose(
  hot(module),
  connect(mapStateToProps, mapDispatchToProps),
  AuthenticationGuard(true)
  // @ts-ignore
)(App);
