import React from "react";
import { useHistory } from "react-router-dom";

import * as routes from "@/constants/routes";

import { Button, Typography, Row } from "antd";
import {
  ExclamationCircleOutlined,
  ReconciliationOutlined,
  RotateRightOutlined,
  ProjectOutlined,
  HeatMapOutlined,
} from "@ant-design/icons";

interface HomeLinkButtonProps {
  title: string;
  route: string;
  key: string;
  icon: any;
}
const HomeLinkButton = (props: HomeLinkButtonProps) => {
  const IconComponent = props.icon;
  const history = useHistory();

  const handleNavigate = (url: string) => {
    history.push(url);
  };

  return (
    <Button className="home-link-button" onClick={() => handleNavigate(props.route)}>
      <div className="home-link-button-inner">
        <IconComponent className="home-link-button-icon" />
        {props.title}
      </div>
    </Button>
  );
};

const HomeTopLinks = () => {
  const links: HomeLinkButtonProps[] = [
    {
      title: "Notices of Work",
      route: routes.NOTICE_OF_WORK_APPLICATIONS.route,
      key: "now",
      icon: HeatMapOutlined,
    },
    {
      title: "Incidents",
      route: routes.INCIDENTS_DASHBOARD.route,
      key: "incidents",
      icon: ExclamationCircleOutlined,
    },
    {
      title: "Variances",
      route: routes.VARIANCE_DASHBOARD.route,
      key: "variances",
      icon: RotateRightOutlined,
    },
    {
      title: "Reports",
      route: routes.REPORTS_DASHBOARD.route,
      key: "reports",
      icon: ReconciliationOutlined,
    },
    {
      title: "Major Projects",
      route: routes.MAJOR_PROJECTS_DASHBOARD.route,
      key: "major-projects",
      icon: ProjectOutlined,
    },
  ];
  return (
    <div>
      <Typography.Title level={4}>Browse CORE</Typography.Title>
      <Typography.Paragraph>Browse and filter the latest submissions.</Typography.Paragraph>
      <Row className="home-container-gutter">
        {links.map((link) => (
          <HomeLinkButton {...link} key={link.key} />
        ))}
      </Row>
    </div>
  );
};

export default HomeTopLinks;
