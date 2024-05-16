import React from "react";
import Overview from "./overview/Overview";
import Projects from "./projects/Projects";
import PermitTabContainer from "./permits/PermitTabContainer";
import Inspections from "./inspections/Inspections";
import Tailings from "./tailings/Tailings";
import Bonds from "./bonds/Bonds";
import Reports from "./reports/Reports";
import Variances from "./variances/Variances";
import Incidents from "./incidents/Incidents";
import NoticesOfDeparture from "@/components/dashboard/mine/noticeOfDeparture/NoticeOfDeparture";
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
} from "@fortawesome/pro-light-svg-icons";

export const getMineDashboardRoutes = (isMajorMine: boolean) =>
  [
    {
      key: "overview",
      label: "Overview",
      icon: <FontAwesomeIcon icon={faHouse} style={{ width: "24px" }} />,
      component: Overview,
    },
    isMajorMine && {
      key: "applications",
      label: "Applications",
      icon: <FontAwesomeIcon icon={faFiles} style={{ width: "24px" }} />,
      component: Projects,
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
      icon: <FontAwesomeIcon icon={faClipboardList} style={{ width: "24px" }} />,
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
  ].filter(Boolean);
