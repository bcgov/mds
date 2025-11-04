import React, { FC } from "react";
import { Link } from "react-router-dom";
import { Menu } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { includes } from "lodash";
import * as routes from "@/constants/routes";
import { IMine } from "@mds/common/interfaces";

interface MineNavigationProps {
  mine: IMine;
  activeButton: string;
  openSubMenuKey: string[];
}

const MineNavigation: FC<MineNavigationProps> = ({ mine, activeButton, openSubMenuKey }) => {
  const ifActiveButton = (route) => (includes(activeButton, route) ? "active-menu-btn" : "");
  const isMajorMine = mine?.major_mine_ind;

  const menuItems = [
    {
      key: "mine-information",
      label: "Mine Information",
      icon: <DownOutlined />,
      id: ifActiveButton("mine-information"),
      children: [
        {
          key: "general",
          label: <Link to={routes.MINE_GENERAL.dynamicRoute(mine.mine_guid)}>General</Link>
        },
        {
          key: "contacts",
          label: <Link to={routes.MINE_CONTACTS.dynamicRoute(mine.mine_guid)}>Contacts</Link>
        },
        {
          key: "mms-archive",
          label: <Link to={routes.MINE_DOCUMENTS.dynamicRoute(mine.mine_guid)}>Archived MMS Files</Link>
        },
        {
          key: "user-access",
          label: <Link to={routes.MINE_ACCESS.dynamicRoute(mine.mine_guid)}>User Access</Link>
        }
      ]
    },
    {
      key: "permits-and-approvals",
      label: "Permits & Approvals",
      icon: <DownOutlined />,
      id: ifActiveButton("permits-and-approvals"),
      children: [
        {
          key: "permits",
          label: <Link to={routes.MINE_PERMITS.dynamicRoute(mine.mine_guid)}>Permits</Link>
        },
        {
          key: "securities",
          label: <Link to={routes.MINE_SECURITIES.dynamicRoute(mine.mine_guid)}>Securities</Link>
        },
        {
          key: "variances",
          label: <Link to={routes.MINE_VARIANCES.dynamicRoute(mine.mine_guid)}>Variances</Link>
        },
        ...(isMajorMine ? [{
          key: "pre-applications",
          label: <Link to={routes.MINE_PRE_APPLICATIONS.dynamicRoute(mine.mine_guid)} data-cy="major-projects-link">Major Projects</Link>
        }] : []),
        {
          key: "notices-of-work",
          label: <Link to={routes.MINE_NOW_APPLICATIONS.dynamicRoute(mine.mine_guid)}>Applications</Link>
        },
        {
          key: "external-authorizations",
          label: <Link to={routes.MINE_EXTERNAL_AUTHORIZATIONS.dynamicRoute(mine.mine_guid)}>Other Ministry Applications and Authorizations</Link>
        },
        {
          key: "nods",
          label: <Link to={routes.MINE_NOTICES_OF_DEPARTURE.dynamicRoute(mine.mine_guid)}>Notices of Departure</Link>
        },
        {
          key: "tailings",
          label: <Link to={routes.MINE_TAILINGS.dynamicRoute(mine.mine_guid)}>Tailings Storage Facilities</Link>
        }
      ]
    },
    {
      key: "oversight",
      label: "Oversight",
      icon: <DownOutlined />,
      id: ifActiveButton("oversight"),
      children: [
        {
          key: "inspections-and-audits",
          label: <Link to={routes.MINE_INSPECTIONS.dynamicRoute(mine.mine_guid)}>Inspections & Audits</Link>
        },
        {
          key: "incidents-and-investigations",
          label: <Link to={routes.MINE_INCIDENTS.dynamicRoute(mine.mine_guid)}>Incidents & Investigations</Link>
        }
      ]
    },
    {
      key: "reports",
      label: "Reports",
      icon: <DownOutlined />,
      id: ifActiveButton("reports"),
      children: [
        {
          key: "code-required-reports",
          label: <Link to={routes.MINE_REPORTS.dynamicRoute(mine.mine_guid, "code-required-reports", {})}>Code Required Reports</Link>
        },
        {
          key: "permit-required-reports",
          label: <Link to={routes.MINE_REPORTS.dynamicRoute(mine.mine_guid, "permit-required-reports", {})}>Permit Required Reports</Link>
        },
        {
          key: "tailings-reports",
          label: <Link to={routes.MINE_TAILINGS_REPORTS.dynamicRoute(mine.mine_guid)}>Tailings Storage Facilities Reports</Link>
        }
      ]
    }
  ];
  return (
    <Menu mode="horizontal" selectedKeys={openSubMenuKey} items={menuItems} />
  );
};

export default MineNavigation;
