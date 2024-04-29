import React from "react";
import Overview from "./overview/Overview";
import MenuUnfoldOutlined from "@ant-design/icons/lib/icons/MenuUnfoldOutlined";
import Projects from "./projects/Projects";
import PermitTabContainer from "./permits/PermitTabContainer";
import Inspections from "./inspections/Inspections";
import Tailings from "./tailings/Tailings";
import Bonds from "./bonds/Bonds";
import Reports from "./reports/Reports";
import Variances from "./variances/Variances";
import Incidents from "./incidents/Incidents";
import NoticesOfDeparture from "@/components/dashboard/mine/noticeOfDeparture/NoticeOfDeparture";

export const getMineDashboardRoutes = (isMajorMine: boolean) =>
  [
    {
      key: "overview",
      label: "Overview",
      icon: <MenuUnfoldOutlined />,
      component: Overview,
    },
    isMajorMine && {
      key: "applications",
      label: "Applications",
      icon: <MenuUnfoldOutlined />,
      component: Projects,
    },
    {
      key: "permits",
      label: "Permits",
      icon: <MenuUnfoldOutlined />,
      component: PermitTabContainer,
    },
    {
      key: "nods",
      label: "Notices of Departure",
      icon: <MenuUnfoldOutlined />,
      component: NoticesOfDeparture,
    },
    {
      key: "inspections",
      label: "Inspections",
      icon: <MenuUnfoldOutlined />,
      component: Inspections,
    },
    {
      key: "incidents",
      label: "Incidents",
      icon: <MenuUnfoldOutlined />,
      component: Incidents,
    },
    {
      key: "variances",
      label: "Variances",
      icon: <MenuUnfoldOutlined />,
      component: Variances,
    },
    {
      key: "reports",
      label: "Reports",
      icon: <MenuUnfoldOutlined />,
      component: Reports,
    },
    {
      key: "bonds",
      label: "Bonds",
      icon: <MenuUnfoldOutlined />,
      component: Bonds,
    },
    {
      key: "tailings",
      label: "Tailings & Dams",
      icon: <MenuUnfoldOutlined />,
      component: Tailings,
    },
  ].filter(Boolean);
