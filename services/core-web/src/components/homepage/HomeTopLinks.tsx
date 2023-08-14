import React from "react";

import * as routes from "@/constants/routes";

import { Button, Typography } from "antd";
import {
  DownOutlined,
  PlusCircleFilled,
  PhoneOutlined,
  MailOutlined,
  ContactsOutlined,
} from "@ant-design/icons";

interface HomeLinkButtonProps {
  title: string;
  route: string;
  key: string;
  icon: any;
}
const HomeLinkButton = (props: HomeLinkButtonProps) => {
  const IconComponent = props.icon;
  return (
    <Button>
      <IconComponent />
      {props.title}
    </Button>
  );
};

const HomeTopLinks = () => {
  const links: HomeLinkButtonProps[] = [
    {
      title: "Notices of Work",
      route: routes.NOTICE_OF_WORK_APPLICATIONS.route,
      key: "now",
      icon: DownOutlined,
    },
    {
      title: "Incidents",
      route: routes.INCIDENTS_DASHBOARD.route,
      key: "incidents",
      icon: PlusCircleFilled,
    },
    {
      title: "Variances",
      route: routes.VARIANCE_DASHBOARD.route,
      key: "variances",
      icon: PhoneOutlined,
    },
    {
      title: "Reports",
      route: routes.REPORTS_DASHBOARD.route,
      key: "reports",
      icon: MailOutlined,
    },
    {
      title: "Major Projects",
      route: routes.MAJOR_PROJECTS_DASHBOARD.route,
      key: "major-projects",
      icon: ContactsOutlined,
    },
  ];
  return (
    <div style={{ border: "1px solid blue" }}>
      <Typography.Title level={1}>Browse CORE</Typography.Title>
      <Typography.Paragraph>Browse and filter the latest submissions.</Typography.Paragraph>
      {links.map((link) => (
        <HomeLinkButton {...link} key={link.key} />
      ))}
    </div>
  );
};

export default HomeTopLinks;
