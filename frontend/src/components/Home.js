import React, { Component } from "react";
import { Layout, BackTop, Button, Icon } from "antd";
import LoadingBar from "react-redux-loading-bar";
import DashboardRoutes from "@/routes/DashboardRoutes";
import { AuthenticationGuard } from "@/HOC/AuthenticationGuard";
import NavBar from "./navigation/NavBar";
import WarningBanner from "@/components/common/WarningBanner";
import { detectIE, detectTestEnvironment } from "@/utils/environmentUtils";
import * as routes from "@/constants/routes";

/**
 * @class Home contains the navigation and wraps the Dashboard routes. Home should not contain any redux logic/state.
 * Home is wrapped in AuthenticationGuard which checks keycloak authorization.
 */

export class Home extends Component {
  state = { isIE: false, isTest: false, activeNavButton: false };

  componentDidMount() {
    this.setState({ isIE: detectIE(), isTest: detectTestEnvironment() });
    this.handleActiveButton(this.props.location.pathname);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.location !== nextProps.location) {
      console.log("did ya change??");
      this.handleActiveButton(nextProps.location.pathname);
    }
  }

  handleActiveButton = (path) => {
    if (path === routes.MINE_HOME_PAGE.route) {
      this.setState({ activeNavButton: path });
    } else if (path === routes.CONTACT_HOME_PAGE.route) {
      this.setState({ activeNavButton: path });
    }
  };

  handleIEClose = () => {
    this.setState({ isIE: false });
  };

  render() {
    const { Content } = Layout;
    return (
      <Layout className="layout">
        <div className="header">
          <NavBar activeButton={this.state.activeNavButton} />
          <LoadingBar
            style={{
              backgroundColor: "#6b6363",
              position: "fixed",
              top: 55,
              zIndex: 90,
              width: "100%",
              height: "8px",
            }}
          />
        </div>
        {this.state.isIE && <WarningBanner onClose={this.handleIEClose} type="IE" />}
        {this.state.isTest && <WarningBanner type="test" />}
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

export default AuthenticationGuard(Home);
