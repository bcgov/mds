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
  faCircleCheck,
  faClipboardList,
  faBrakeWarning,
  faHexagonExclamation,
  faDiamondTurnRight,
  faShieldKeyhole,
  faHouseWater,
} from "@fortawesome/pro-light-svg-icons";
import { faBuildingMagnifyingGlass } from "@fortawesome/pro-solid-svg-icons";

export const getMineDashboardRoutes = (isMajorMine: boolean) =>
  [
    {
      key: "overview",
      label: "Overview",
      icon: <FontAwesomeIcon icon={faHouse} />,
      component: Overview,
    },
    isMajorMine && {
      key: "applications",
      label: "Applications",
      icon: <FontAwesomeIcon icon={faFiles} />,
      component: Projects,
    },
    {
      key: "permits",
      label: "Permits",
      icon: <FontAwesomeIcon icon={faCircleCheck} />,
      component: PermitTabContainer,
    },
    {
      key: "inspections",
      label: "Inspections",
      icon: <FontAwesomeIcon icon={faBuildingMagnifyingGlass as any} />,
      component: Inspections,
    },
    {
      key: "reports",
      label: "Reports",
      icon: <FontAwesomeIcon icon={faClipboardList} />,
      component: Reports,
    },
    {
      key: "incidents",
      label: "Incidents",
      icon: <FontAwesomeIcon icon={faBrakeWarning} />,
      component: Incidents,
    },
    {
      key: "nods",
      label: "Notices of Departure",
      icon: <FontAwesomeIcon icon={faHexagonExclamation} />,
      component: NoticesOfDeparture,
    },
    {
      key: "variances",
      label: "Variances",
      icon: <FontAwesomeIcon icon={faDiamondTurnRight} />,
      component: Variances,
    },
    {
      key: "bonds",
      label: "Bonds",
      icon: <FontAwesomeIcon icon={faShieldKeyhole} />,
      component: Bonds,
    },
    {
      key: "tailings",
      label: "Tailings & Dams",
      icon: <FontAwesomeIcon icon={faHouseWater} />,
      component: Tailings,
    },
  ].filter(Boolean);
