import React, { FC, useEffect, useState } from "react";
import { compose, bindActionCreators } from "redux";
import { connect } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { hot } from "react-hot-loader";
import LoadingOutlined from "@ant-design/icons/LoadingOutlined";
import { Layout, BackTop, Row, Col, Spin } from "antd";
import { loadBulkStaticContent } from "@mds/common/redux/actionCreators/staticContentActionCreator";
import { getStaticContentLoadingIsComplete } from "@mds/common/redux/selectors/staticContentSelectors";
import MediaQuery from "react-responsive";
import { isAuthenticated } from "@mds/common/redux/selectors/authenticationSelectors";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ModalWrapper from "@/components/common/wrappers/ModalWrapper";
import DocumentViewer from "@/components/syncfusion/DocumentViewer";
import AuthenticationGuard from "@/HOC/AuthenticationGuard";
import WarningBanner from "@/components/common/WarningBanner";

import Routes from "./routes/Routes";
import configureStore from "./store/configureStore";
import { detectIE } from "@mds/common";
import { storeSystemFlag } from "@mds/common/redux/actions/authenticationActions";

export const store = configureStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

Spin.setDefaultIndicator(<LoadingOutlined style={{ fontSize: 40 }} />);

interface AppProps {
  isAuthenticated: boolean;
  staticContentLoadingIsComplete: boolean;
  loadBulkStaticContent: () => void;
  storeSystemFlag: (flag) => void;
}

const App: FC<AppProps> = (props) => {
  const [isIE, setIsIE] = useState(true);
  const [isMobile, setIsMobile] = useState(true);

  const {
    loadBulkStaticContent,
    storeSystemFlag,
    isAuthenticated = false,
    staticContentLoadingIsComplete = false,
  } = props;

  useEffect(() => {
    if (isAuthenticated) {
      loadBulkStaticContent();
    }
    setIsIE(!!detectIE());
    storeSystemFlag("ms");
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
      storeSystemFlag,
    },
    dispatch
  );

export default compose(
  hot(module),
  connect(mapStateToProps, mapDispatchToProps),
  AuthenticationGuard(true)
  // @ts-ignore
)(App);
