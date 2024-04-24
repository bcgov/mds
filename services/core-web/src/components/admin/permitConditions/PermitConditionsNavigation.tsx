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

interface AdminNavigationProps {
  activeButton: string;
  openSubMenuKey: string[];
}

const PermitConditionsNavigation: FC<AdminNavigationProps> = (props) => {
  const { isFeatureEnabled } = useFeatureFlag();
  const complianceRolePresent = useSelector((state) =>
    userHasRole(state, USER_ROLES.role_edit_compliance_codes)
  );
  const complianceEnabled = isFeatureEnabled(Feature.HSRC_CODE_EDIT) && complianceRolePresent;
  const ifActiveButton = (route) => (includes(props.activeButton, route) ? "active-menu-btn" : "");

  const complianceItem = {
    label: "Health and Safety Reclamation Code",
    key: "hsrc-management",
    id: ifActiveButton("hsrc-management"),
    icon: <DownOutlined />,
    children: [
      {
        key: "submenu-compliance-codes",
        label: (
          <Link to={routes.ADMIN_HSRC_COMPLIANCE_CODE_MANAGEMENT.route}>
            Manage Compliance Codes
          </Link>
        ),
      },
    ],
  };

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
