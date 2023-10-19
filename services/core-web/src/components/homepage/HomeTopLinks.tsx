import React from "react";
import { useHistory } from "react-router-dom";

import * as routes from "@/constants/routes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faTrianglePersonDigging,
  faBrakeWarning,
  faDiamondTurnRight,
  faClipboardList,
  faMountains,
} from "@fortawesome/pro-light-svg-icons";

import { Button, Typography, Row } from "antd";

interface HomeLinkButtonProps {
  title: string;
  route: string;
  key: string;
  icon: any;
  datacy: string
}
const HomeLinkButton = (props: HomeLinkButtonProps) => {
  const IconComponent = props.icon;
  const history = useHistory();
  const handleNavigate = (url: string) => {
    history.push(url);
  };

  return (
    <Button className="home-link-button" onClick={() => handleNavigate(props.route)}>
      <div className="home-link-button-inner" data-cy={props.datacy}>
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
      icon: () => <FontAwesomeIcon icon={faTrianglePersonDigging} />,
      datacy: "home-link-button-now",
    },
    {
      title: "Incidents",
      route: routes.INCIDENTS_DASHBOARD.route,
      key: "incidents",
      icon: () => <FontAwesomeIcon icon={faBrakeWarning} />,
      datacy: "home-link-button-incidents",
    },
    {
      title: "Variances",
      route: routes.VARIANCE_DASHBOARD.route,
      key: "variances",
      icon: () => <FontAwesomeIcon icon={faDiamondTurnRight} />,
      datacy: "home-link-button-variances",
    },
    {
      title: "Reports",
      route: routes.REPORTS_DASHBOARD.route,
      key: "reports",
      icon: () => <FontAwesomeIcon icon={faClipboardList} />,
      datacy: "home-link-button-reports",
    },
    {
      title: "Major Projects",
      route: routes.MAJOR_PROJECTS_DASHBOARD.route,
      key: "major-projects",
      icon: () => <FontAwesomeIcon icon={faMountains} />,
      datacy: "home-link-button-major-projects",
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
