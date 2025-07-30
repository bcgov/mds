import React, { FC } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Menu } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { includes } from "lodash";
import * as routes from "@/constants/routes";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";
import { USER_ROLES } from "@mds/common/constants/environment";
import { Feature } from "@mds/common/utils/featureFlag";
import { COMPLIANCE_TABS } from "../complianceCodes/ComplianceManagement";

interface AdminNavigationProps {
  activeButton: string;
  openSubMenuKey: string[];
}

const PermitConditionsNavigation: FC<AdminNavigationProps> = (props) => {
  const { isFeatureEnabled } = useFeatureFlag();
  const complianceRolePresent = useSelector(
    userHasRole(USER_ROLES.role_edit_compliance_codes)
  );
  const complianceEnabled = isFeatureEnabled(Feature.HSRC_CODE_EDIT) && complianceRolePresent;
  const enablePermitConditionTags = isFeatureEnabled(Feature.PERMIT_CONDITION_TAGS);

  const ifActiveButton = (route) => (includes(props.activeButton, route) ? "active-menu-btn" : "");

  const complianceItem = {
    label: "Health, Safety and Reclamation Code",
    key: "hsrc-management",
    id: ifActiveButton("hsrc-management"),
    icon: <DownOutlined />,
    children: [
      {
        key: COMPLIANCE_TABS[0],
        label: (
          <Link to={routes.ADMIN_HSRC_COMPLIANCE_CODE_MANAGEMENT.dynamicRoute(COMPLIANCE_TABS[0])}>
            Manage Compliance Codes
          </Link>
        ),
      },
      {
        key: COMPLIANCE_TABS[1],
        label: (
          <Link to={routes.ADMIN_HSRC_COMPLIANCE_CODE_MANAGEMENT.dynamicRoute(COMPLIANCE_TABS[1])}>
            Manage Compliance Reports
          </Link>
        )
      }
    ],
  };

  const tagsItem = {
    label: "Permit Condition Tags",
    key: "tag-management",
    id: ifActiveButton("tag-management"),
    icon: <DownOutlined />,
    children: [{
      key: "manage-tags",
      label: (
        <Link to={routes.ADMIN_PERMIT_CONDITION_TAG_MANAGEMENT.route}>
          Manage Tags
        </Link>
      )
    }
    ]
  }

  const items = [
    {
      label: "Permit Conditions",
      icon: <DownOutlined />,
      id: ifActiveButton("permit-condition-management"),
      key: "permit-condition-management",
      children: [
        {
          key: "sand-and-gravel",
          label: (
            <Link to={routes.ADMIN_PERMIT_CONDITION_MANAGEMENT.dynamicRoute("sand-and-gravel")}>
              Sand & Gravel
            </Link>
          ),
        },
        {
          key: "exploration",
          label: (
            <Link to={routes.ADMIN_PERMIT_CONDITION_MANAGEMENT.dynamicRoute("exploration")}>
              Exploration (MX/CX)
            </Link>
          ),
        },
        {
          key: "quarry",
          label: (
            <Link to={routes.ADMIN_PERMIT_CONDITION_MANAGEMENT.dynamicRoute("quarry")}>Quarry</Link>
          ),
        },
        {
          key: "placer",
          label: (
            <Link to={routes.ADMIN_PERMIT_CONDITION_MANAGEMENT.dynamicRoute("placer")}>Placer</Link>
          ),
        },
      ],
    },
    complianceEnabled && complianceItem,
    enablePermitConditionTags && tagsItem
  ].filter(Boolean);

  return (
    <Menu
      mode="horizontal"
      selectedKeys={props.openSubMenuKey}
      items={items}
      className="item-menu"
    />
  );
};

export default PermitConditionsNavigation;
