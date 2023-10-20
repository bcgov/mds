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
  id: string;
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
      <div className="home-link-button-inner" data-cy={`home-link-button-${props.id}`}>
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
      id: "now",
      icon: () => <FontAwesomeIcon icon={faTrianglePersonDigging} />,
    },
    {
      title: "Incidents",
      route: routes.INCIDENTS_DASHBOARD.route,
      id: "incidents",
      icon: () => <FontAwesomeIcon icon={faBrakeWarning} />,
    },
    {
      title: "Variances",
      route: routes.VARIANCE_DASHBOARD.route,
      id: "variances",
      icon: () => <FontAwesomeIcon icon={faDiamondTurnRight} />,
    },
    {
      title: "Reports",
      route: routes.REPORTS_DASHBOARD.route,
      id: "reports",
      icon: () => <FontAwesomeIcon icon={faClipboardList} />,
    },
    {
      title: "Major Projects",
      route: routes.MAJOR_PROJECTS_DASHBOARD.route,
      id: "major-projects",
      icon: () => <FontAwesomeIcon icon={faMountains} />,
    },
  ];
  return (
    <div>
      <Typography.Title level={4}>Browse CORE</Typography.Title>
      <Typography.Paragraph>Browse and filter the latest submissions.</Typography.Paragraph>
      <Row className="home-container-gutter">
        {links.map((link) => (
          <HomeLinkButton {...link} key={link.id} />
        ))}
      </Row>
    </div>
  );
};

export default HomeTopLinks;
