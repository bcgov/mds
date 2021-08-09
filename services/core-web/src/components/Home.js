import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Layout, BackTop, Button } from "antd";
import { ArrowUpOutlined, TrophyOutlined } from "@ant-design/icons";
import { Alert, Row, Col, Typography } from "antd";
import PropTypes from "prop-types";
import MediaQuery from "react-responsive";
import LoadingBar from "react-redux-loading-bar";
import {
  detectIE,
  detectTestEnvironment,
  detectDevelopmentEnvironment,
  detectProdEnvironment,
} from "@common/utils/environmentUtils";
import { getStaticContentLoadingIsComplete } from "@common/selectors/staticContentSelectors";
import {
  loadBulkStaticContent,
  fetchInspectors,
} from "@common/actionCreators/staticContentActionCreator";
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
};

export class Home extends Component {
  state = {
    isIE: false,
    isTest: false,
    isDev: false,
    isMobile: true,
    activeNavButton: "",
    isMenuOpen: false,
    isProd: false,
  };

  componentDidMount() {
    this.setState({
      isIE: detectIE(),
      isTest: detectTestEnvironment(),
      isDev: detectDevelopmentEnvironment(),
      isProd: detectProdEnvironment(),
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

  handleProdClose = () => {
    this.setState({ isProd: false });
  };

  toggleHamburgerMenu = () => {
    this.setState((prevState) => ({ isMenuOpen: !prevState.isMenuOpen }));
  };

  loadStaticContent = () => {
    this.props.loadBulkStaticContent();
    this.props.fetchInspectors();
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
              zIndex: 999,
              height: 8,
            }}
          />
        </div>
        {this.state.isTest && <WarningBanner type={WARNING_TYPES.TEST} />}
        {this.state.isIE && <WarningBanner type={WARNING_TYPES.IE} onClose={this.handleIEClose} />}
        {this.state.isProd && (
          <Row>
            <Col span={24}>
              <Alert
                className="goodbye-banner"
                message={
                  <Typography.Text strong bold>
                    Best Wishes, Warm Regards Brian!
                  </Typography.Text>
                }
                description={
                  <Typography.Text>
                    <span>
                      Friday August 13th is Brian Finns last day with the MDS team. He's been a huge
                      part of the team since the software was nothing more than a concept.
                      <br />
                      If you've ever had a meaningful conversation with Brian or enjoyed his
                      company, let him know how you feel by clicking{" "}
                      <a href={`mailto:brian.finn@gov.bc.ca`}>here</a> and sending him an email to
                      wish him well in his new role
                    </span>
                  </Typography.Text>
                }
                type="warning"
                closable
                onClose={this.handleProdClose}
                showIcon
                icon={<TrophyOutlined />}
              />
            </Col>
          </Row>
        )}
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
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(AuthenticationGuard(Home));
