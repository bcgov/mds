import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Layout, BackTop, Button } from "antd";
import { ArrowUpOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import MediaQuery from "react-responsive";
import LoadingBar from "react-redux-loading-bar";
import { getStaticContentLoadingIsComplete } from "@common/selectors/staticContentSelectors";
import {
  loadBulkStaticContent,
  fetchInspectors,
  fetchProjectLeads,
} from "@common/actionCreators/staticContentActionCreator";
import {
  detectIE,
  detectTestEnvironment,
  detectDevelopmentEnvironment,
} from "@common/utils/environmentUtils";
import DashboardRoutes from "@/routes/DashboardRoutes";
import { AuthenticationGuard } from "@/HOC/AuthenticationGuard";
import WarningBanner, { WARNING_TYPES } from "@/components/common/WarningBanner";
import * as Styles from "@/constants/styles";
import NavBar from "./navigation/NavBar";
import Loading from "./common/Loading";

/**
 * @class Home contains the navigation and wraps the Dashboard routes. Home should not contain any redux logic/state.
 * Home is wrapped in AuthenticationGuard which checks keycloak authorization.
 */

const propTypes = {
  staticContentLoadingIsComplete: PropTypes.bool.isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
  loadBulkStaticContent: PropTypes.func.isRequired,
  fetchInspectors: PropTypes.func.isRequired,
  fetchProjectLeads: PropTypes.func.isRequired,
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
    this.loadStaticContent();
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

  loadStaticContent = () => {
    this.props.loadBulkStaticContent();
    this.props.fetchInspectors();
    this.props.fetchProjectLeads();
  };

  render() {
    if (!this.props.staticContentLoadingIsComplete) {
      return <Loading />;
    }
    return (
      <Layout className="layout">
        <div className="header">
          <NavBar
            activeButton={this.state.activeNavButton}
            isMenuOpen={this.state.isMenuOpen}
            toggleHamburgerMenu={this.toggleHamburgerMenu}
          />
          <div id="menu-loadingbar-background" />
          <LoadingBar
            style={{
              backgroundColor: Styles.COLOR.violet,
              position: "fixed",
              top: 53,
              zIndex: 1111,
              height: 8,
            }}
          />
        </div>
        {this.state.isTest && <WarningBanner type={WARNING_TYPES.TEST} />}
        {this.state.isIE && <WarningBanner type={WARNING_TYPES.IE} onClose={this.handleIEClose} />}
        <MediaQuery maxWidth={500}>
          {this.state.isMobile && !this.state.isDev && (
            <WarningBanner type={WARNING_TYPES.MOBILE} onClose={this.handleMobileWarningClose} />
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
  }
}

Home.propTypes = propTypes;

const mapStateToProps = (state) => ({
  staticContentLoadingIsComplete: getStaticContentLoadingIsComplete(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      loadBulkStaticContent,
      fetchInspectors,
      fetchProjectLeads,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(AuthenticationGuard(Home));
