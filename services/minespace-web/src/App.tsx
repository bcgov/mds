import React, { FC, useEffect, useState } from "react";
import { compose } from "redux";
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
import DocumentViewer from "@mds/common/components/syncfusion/DocumentViewer";
import AuthenticationGuard from "@/HOC/AuthenticationGuard";
import WarningBanner from "@/components/common/WarningBanner";

import Routes from "./routes/Routes";
import configureStore from "./store/configureStore";
import { storeSystemFlag } from "@mds/common/redux/actions/authenticationActions";
import { SystemFlagEnum } from "@mds/common/constants/enums";
import { detectIE } from "@mds/common/utils/environmentUtils";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { fetchUser } from "@mds/common/redux/slices/userSlice";

export const store = configureStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

Spin.setDefaultIndicator(<LoadingOutlined style={{ fontSize: 40 }} />);

const App: FC = () => {
  const [isIE, setIsIE] = useState(true);
  const [isMobile, setIsMobile] = useState(true);
  const isUserAuthenticated = useAppSelector(isAuthenticated);
  const staticContentLoadingIsComplete = useAppSelector(getStaticContentLoadingIsComplete);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isUserAuthenticated) {
      dispatch(loadBulkStaticContent());
    }
    setIsIE(!!detectIE());
    dispatch(storeSystemFlag(SystemFlagEnum.ms));
  }, []);

  useEffect(() => {
    if (isUserAuthenticated) {
      if (!staticContentLoadingIsComplete) {
        dispatch(loadBulkStaticContent());
      }
      dispatch(fetchUser());
    }
  }, [isUserAuthenticated]);

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
    <>
      <BrowserRouter basename={process.env.BASE_PATH}>
        <>
          <Layout>
            <Header xs={xs} lg={lg} xl={xl} xxl={xxl} isAuthenticated={isUserAuthenticated} />
            <Layout>
              <Layout.Content>
                {isIE && <WarningBanner type="IE" onClose={handleBannerClose} />}
                <MediaQuery maxWidth={500}>
                  {isMobile && <WarningBanner type="mobile" onClose={handleMobileWarningClose} />}
                </MediaQuery>
                <Row justify="center" align="top" className="content-wrapper">
                  <Routes />
                </Row>
                <BackTop />
              </Layout.Content>
            </Layout>
            <Footer xs={xs} lg={lg} xl={xl} xxl={xxl} />
          </Layout>
          <ModalWrapper />
        </>
      </BrowserRouter>
      <DocumentViewer />
    </>
  );
};

export default compose(hot(module), AuthenticationGuard(true))(App);
