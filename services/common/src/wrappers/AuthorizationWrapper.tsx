import React, { FC, ReactNode, ReactNodeArray } from "react";
import { startCase, camelCase } from "lodash";
import { Tooltip } from "antd";
import { useSelector } from "react-redux";
import { userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";
import { detectProdEnvironment } from "@mds/common/utils";
import { USER_ROLES } from "@mds/common/constants/environment";

/**
 * @constant AuthorizationWrapper conditionally renders react children depending
 * if the role passed in matches the user permissions.
 *
 * NOTE: If the childComponent is an ant design child component**
 * IE. Menu.Item,
 * <Menu>
 *    <Menu.Item />
 * </Menu>
 *  The implicit flow of passing props down to children could be interrupted.
 * Ie, Menu passes onItemHover down to Menu.Item, with AuthorizationWrapper wrapping Menu.Item, it no longer has access
 * to onItemHover, as a solution, a <div className="custom-menu-item" /> will be used in place of Menu.Item and will inherit all CSS from
 * Menu.Item.
 * NavBar.js use case example:
 * <Menu>
    <AuthorizationWrapper permission="role_admin">
      <div className="custom-menu-item">
        <Link to={router.ADMIN_DASHBOARD.route}>
          Admin
        </Link>
      </div>
    </AuthorizationWrapper>
  </Menu>
 *
 * isMajorMine - has been removed as it has no use cases
 * inDevelopment - has been removed as it has no use cases and is superceded by flagsmith
 * inTesting - deprecated usage: superceded by flagsmith but some use cases remain
 */


interface AuthorizationWrapperProps {
  /**
   * @deprecated Use feature flags instead of inTesting property.
   */
  inTesting?: boolean;
  permission?: string;
  showToolTip?: boolean;
  children: ReactNode | ReactNodeArray;
}

export const AuthorizationWrapper: FC<AuthorizationWrapperProps> = ({
  inTesting,
  children,
  permission = "",
  showToolTip = true,
}) => {
  const inTestCheck =
    inTesting === undefined || (inTesting && !detectProdEnvironment());
  const userHasPermission = useSelector(userHasRole(permission));
  const permissionCheck = userHasPermission || permission === "";
  const isAdmin = useSelector(userHasRole(USER_ROLES.role_admin));

  const title = () => {
    const permissionLabel = USER_ROLES[permission] ?? permission;
    const inTest = inTesting ? "Not Visible in Production" : "";
    return (
      <ul style={{ listStyle: "none", marginBottom: "0" }}>
        {permission !== "" && <li>{startCase(camelCase(permissionLabel))}</li>}
        {inTest && <li>{inTest}</li>}
      </ul>
    );
  };

  // all actions are visible to admin, except when they should only exist in their respective environments. (ie admin cannot see features in prod if they are feature flagged to test)
  const adminOverride = isAdmin && !inTestCheck;
  // Determine if children is an array and needs wrapping
  const needsWrapper = Array.isArray(children) && children.length > 1;
  const tooltipContent = needsWrapper
    ? <span>{children}</span>
    : children;

  return (
    (adminOverride || (inTestCheck && permissionCheck)) && (
      <Tooltip
        title={isAdmin && showToolTip ? title() : ""}
        placement="left"
        mouseEnterDelay={1.7}
        mouseLeaveDelay={0}
        arrowPointAtCenter
        overlayClassName="tooltip__admin"
        style={{ zIndex: 100000 }}
        trigger={["hover"]}
        destroyTooltipOnHide
      >
        {tooltipContent}
      </Tooltip>
    )
  );
};

export default AuthorizationWrapper;
