import React from "react";
import { Badge } from "antd";
import Overview from "./overview/Overview";
import ViewProjects from "./projects/ViewProjects";
import PermitTabContainer from "./permits/PermitTabContainer";
import Inspections from "./inspections/Inspections";
import Tailings from "./tailings/Tailings";
import Bonds from "./bonds/Bonds";
import Reports from "./reports/Reports";
import Variances from "./variances/Variances";
import Incidents from "./incidents/Incidents";
import NoticesOfDeparture from "@/components/dashboard/mine/noticeOfDeparture/NoticeOfDeparture";
import MineUserAccessPage from "./users/MineUserAccessPage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faFiles,
  faFileCircleCheck,
  faClipboardList,
  faBrakeWarning,
  faHexagonExclamation,
  faDiamondTurnRight,
  faShieldKeyhole,
  faHouseWater,
  faUserMagnifyingGlass,
  faUsers,
} from "@fortawesome/pro-light-svg-icons";

export const getMineDashboardRoutes = (showApplications, reportsBadgeCount?: number) =>
  [
    {
      key: "overview",
      label: "Overview",
      icon: <FontAwesomeIcon icon={faHouse} style={{ width: "24px" }} />,
      component: Overview,
    },
    showApplications && {
      key: "applications",
      label: "Applications",
      icon: <FontAwesomeIcon icon={faFiles} style={{ width: "24px" }} />,
      component: ViewProjects,
    },
    {
      key: "permits",
      label: "Permits",
      icon: <FontAwesomeIcon icon={faFileCircleCheck} style={{ width: "24px" }} />,
      component: PermitTabContainer,
    },
    {
      key: "inspections",
      label: "Inspections",
      icon: <FontAwesomeIcon icon={faUserMagnifyingGlass} style={{ width: "24px" }} />,
      component: Inspections,
    },
    {
      key: "reports",
      label: "Reports",
      icon: (
        <Badge
          count={reportsBadgeCount}
          overflowCount={99}
          showZero={false}
          style={{ backgroundColor: "#d9363e" }}
        >
          <FontAwesomeIcon icon={faClipboardList} style={{ width: "24px" }} />
        </Badge>
      ),
      component: Reports,
    },
    {
      key: "incidents",
      label: "Incidents",
      icon: <FontAwesomeIcon icon={faBrakeWarning} style={{ width: "24px" }} />,
      component: Incidents,
    },
    {
      key: "nods",
      label: "Notices of Departure",
      icon: <FontAwesomeIcon icon={faHexagonExclamation} style={{ width: "24px" }} />,
      component: NoticesOfDeparture,
    },
    {
      key: "variances",
      label: "Variances",
      icon: <FontAwesomeIcon icon={faDiamondTurnRight} style={{ width: "24px" }} />,
      component: Variances,
    },
    {
      key: "bonds",
      label: "Bonds",
      icon: <FontAwesomeIcon icon={faShieldKeyhole} style={{ width: "24px" }} />,
      component: Bonds,
    },
    {
      key: "tailings",
      label: "Tailings & Dams",
      icon: <FontAwesomeIcon icon={faHouseWater} style={{ width: "24px" }} />,
      component: Tailings,
    },
    {
      key: "user-access",
      label: "User Access",
      icon: <FontAwesomeIcon icon={faUsers} style={{ width: "24px" }} />,
      component: MineUserAccessPage,
    },
  ].filter(Boolean);
