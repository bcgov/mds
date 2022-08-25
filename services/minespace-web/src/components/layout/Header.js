import React from "react";
import { Col, Layout, Row } from "antd";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import HeaderDropdown from "@/components/layout/HeaderDropdown";
import * as routes from "@/constants/routes";
import { BC_GOV } from "@/constants/assets";
import NotificationDrawer from "@/components/layout/NotificationDrawer";

const propTypes = {
  xs: PropTypes.number.isRequired,
  lg: PropTypes.number.isRequired,
  xl: PropTypes.number.isRequired,
  xxl: PropTypes.number.isRequired,
  isAuthenticated: PropTypes.bool,
};

const defaultProps = {
  isAuthenticated: false,
};

export const Header = (props) => {
  return (
    <Layout.Header>
      <Row type="flex" justify="center" align="top">
        <Col xs={props.xs} lg={props.lg} xl={props.xl} xxl={props.xxl}>
          <div className="header-content">
            <div>
              <a className="header-logo" href="https://gov.bc.ca/">
                <img alt="BC Government Logo" src={BC_GOV} width={154} />
              </a>
              <Link className="header-title" to={routes.HOME.route}>
                MineSpace
              </Link>
            </div>
            <div className="inline-flex items-center">
              <HeaderDropdown />
              {props.isAuthenticated && <NotificationDrawer />}
            </div>
          </div>
        </Col>
      </Row>
    </Layout.Header>
  );
};

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;

export default Header;
