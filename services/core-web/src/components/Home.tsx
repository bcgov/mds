import React, { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BackTop, Button, Layout } from "antd";
import { ArrowUpOutlined } from "@ant-design/icons";
import MediaQuery from "react-responsive";
import LoadingBar from "react-redux-loading-bar";
import { getStaticContentLoadingIsComplete } from "@mds/common/redux/selectors/staticContentSelectors";
import {
  fetchInspectors,
  fetchProjectLeads,
  loadBulkStaticContent,
} from "@mds/common/redux/actionCreators/staticContentActionCreator";
import { detectDevelopmentEnvironment, detectIE, detectTestEnvironment } from "@mds/common/utils";
import DashboardRoutes from "@/routes/DashboardRoutes";
import { AuthenticationGuard } from "@/HOC/AuthenticationGuard";
import WarningBanner, { WARNING_TYPES } from "@/components/common/WarningBanner";
import NavBar from "./navigation/NavBar";
import Loading from "./common/Loading";
import { useLocation } from "react-router-dom";
import { fetchUser, getUser } from "@mds/common/redux/slices/userSlice";

/**
 * @func Home contains the navigation and wraps the Dashboard routes. Home should not contain any redux logic/state.
 * Home is wrapped in AuthenticationGuard which checks keycloak authorization.
 */

export const Home: FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const staticContentLoadingIsComplete = useSelector(getStaticContentLoadingIsComplete);
  const user = useSelector(getUser);

  const [isIE, setIsIE] = useState<boolean | number>(false);
  const [isTest, setIsTest] = useState(false);
  const [isDev, setIsDev] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [activeNavButton, setActiveNavButton] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsIE(detectIE());
    setIsTest(detectTestEnvironment());
    setIsDev(detectDevelopmentEnvironment());
    loadStaticContent();
  }, []);

  useEffect(() => {
    handleActiveButton(location.pathname);
    setIsMenuOpen(false);
  }, [location]);

  const handleActiveButton = (path) => {
    setActiveNavButton(path);
  };

  const handleIEClose = () => {
    setIsIE(false);
  };

  const handleMobileWarningClose = () => {
    setIsMobile(false);
  };

  const toggleHamburgerMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const loadStaticContent = () => {
    dispatch(loadBulkStaticContent());
    dispatch(fetchInspectors());
    dispatch(fetchProjectLeads());
    dispatch(fetchUser());
  };

  if (!staticContentLoadingIsComplete || !user) {
    return <Loading />;
  }
  return (
    <Layout className="layout">
      <div className="header">
        <NavBar
          activeButton={activeNavButton}
          isMenuOpen={isMenuOpen}
          toggleHamburgerMenu={toggleHamburgerMenu}
        />
        <div id="menu-loadingbar-background" />
        <LoadingBar className="menu-loadingbar-loading" />
      </div>
      {isTest && <WarningBanner type={WARNING_TYPES.TEST} />}
      {isIE && <WarningBanner type={WARNING_TYPES.IE} onClose={handleIEClose} />}
      <MediaQuery maxWidth={500}>
        {isMobile && !isDev && (
          <WarningBanner type={WARNING_TYPES.MOBILE} onClose={handleMobileWarningClose} />
        )}
      </MediaQuery>
      <Layout.Content className="content">
        <DashboardRoutes />
        <BackTop>
          <Button type="primary">
            <ArrowUpOutlined />
          </Button>
        </BackTop>
      </Layout.Content>
      <div className="footer" />
    </Layout>
  );
};

export default AuthenticationGuard(Home);
