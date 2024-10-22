import React, { FC } from "react";
import { Col, Layout, Row } from "antd";
import { Link } from "react-router-dom";
import HeaderDropdown from "@/components/layout/HeaderDropdown";
import * as routes from "@/constants/routes";
import { BC_GOV } from "@/constants/assets";
import NotificationDrawer from "@/components/layout/NotificationDrawer";
import HelpGuide from "@mds/common/components/help/HelpGuide";

interface HeaderProps {
  xs: number;
  lg: number;
  xl: number;
  xxl: number;
  isAuthenticated: boolean;
}

export const Header: FC<HeaderProps> = ({ xs, lg, xl, xxl, isAuthenticated = false }) => {
  return (
    <Layout.Header>
      <Row justify="center" align="top">
        <Col xs={xs} lg={lg} xl={xl} xxl={xxl}>
          <div className="header-content">
            <div>
              <a className="header-logo" href="https://gov.bc.ca/">
                <img alt="BC Government Logo" src={BC_GOV} width={154} height={43} />
              </a>
              <Link className="header-title" to={routes.HOME.route}>
                MineSpace
              </Link>
            </div>
            <div className="inline-flex items-center">
              <HeaderDropdown />
              {isAuthenticated && <NotificationDrawer />}
              <HelpGuide />
            </div>
          </div>
        </Col>
      </Row>
    </Layout.Header>
  );
};

export default Header;
