import React, { Component } from "react";
import { Layout, BackTop, Button, Icon } from "antd";
import PropTypes from "prop-types";
import MediaQuery from "react-responsive";
import LoadingBar from "react-redux-loading-bar";
import DashboardRoutes from "@/routes/DashboardRoutes";
import { AuthenticationGuard } from "@/HOC/AuthenticationGuard";
import NavBar from "./navigation/NavBar";
import WarningBanner from "@/components/common/WarningBanner";
import * as Styles from "@/constants/styles";
import {
  detectIE,
  detectTestEnvironment,
  detectDevelopmentEnvironment,
} from "@/utils/environmentUtils";
/**
 * @class Home contains the navigation and wraps the Dashboard routes. Home should not contain any redux logic/state.
 * Home is wrapped in AuthenticationGuard which checks keycloak authorization.
 */

const propTypes = {
  location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
};

export class Home extends Component {
  state = {
    isIE: false,
    isTest: false,
    isDev: false,
    isMobile: true,
    activeNavButton: "",
    isMenuOpen: false,
  };

  componentDidMount() {
    this.setState({
      isIE: detectIE(),
      isTest: detectTestEnvironment(),
      isDev: detectDevelopmentEnvironment(),
    });
    this.handleActiveButton(this.props.location.pathname);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.location !== nextProps.location) {
      this.handleActiveButton(nextProps.location.pathname);
      // close Menu when link is clicked
      this.setState({ isMenuOpen: false });
    }
  }

  handleActiveButton = (path) => {
    this.setState({ activeNavButton: path });
  };

  handleIEClose = () => {
    this.setState({ isIE: false });
  };

  handleMobileWarningClose = () => {
    this.setState({ isMobile: false });
  };

  toggleHamburgerMenu = () => {
    this.setState((prevState) => ({ isMenuOpen: !prevState.isMenuOpen }));
  };

  render() {
    const { Content } = Layout;
    return (
      <Layout className="layout">
        <div className="header">
          <NavBar
            activeButton={this.state.activeNavButton}
            isMenuOpen={this.state.isMenuOpen}
            toggleHamburgerMenu={this.toggleHamburgerMenu}
          />
          <LoadingBar
            style={{
              backgroundColor: Styles.COLOR.violet,
              position: "fixed",
              top: 53,
              zIndex: 1000,
              width: "100%",
              height: "8px",
            }}
          />
        </div>
        {this.state.isIE && <WarningBanner onClose={this.handleIEClose} type="IE" />}
        {this.state.isTest && <WarningBanner type="test" />}
        <MediaQuery maxWidth={500}>
          {this.state.isMobile && !this.state.isDev && (
            <WarningBanner type="mobile" onClose={this.handleMobileWarningClose} />
          )}
        </MediaQuery>
        <Content className="content">
          <DashboardRoutes />
          <BackTop>
            <Button type="primary">
              <Icon type="arrow-up" theme="outlined" />
            </Button>
          </BackTop>
        </Content>
        <div className="footer" />
      </Layout>
    );
  }
}

Home.propTypes = propTypes;

export default AuthenticationGuard(Home);
