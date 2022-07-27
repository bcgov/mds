import React, { useState } from "react";
import { Badge, Button, Col, Layout, Row } from "antd";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { BellOutlined } from "@ant-design/icons";
import HeaderDropdown from "@/components/layout/HeaderDropdown";
import * as routes from "@/constants/routes";
import { BC_GOV } from "@/constants/assets";
import NotificationDrawer from "@/components/layout/NotificationDrawer";

const propTypes = {
  xs: PropTypes.number.isRequired,
  lg: PropTypes.number.isRequired,
  xl: PropTypes.number.isRequired,
  xxl: PropTypes.number.isRequired,
};

export const Header = (props) => {
  const [open, setOpen] = useState(true);

  const handleCollapse = () => {
    setOpen(!open);
  };

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
              <Button
                onClick={!open ? handleCollapse : () => {}}
                type="text"
                icon={
                  <Badge count={5}>
                    <BellOutlined className="notification-icon" />
                  </Badge>
                }
              />
              <NotificationDrawer setOpen={setOpen} open={open} />
            </div>
          </div>
        </Col>
      </Row>
    </Layout.Header>
  );
};
Header.propTypes = propTypes;

export default Header;
