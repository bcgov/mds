import React from "react";
import PropTypes from "prop-types";
import { startCase, camelCase } from "lodash";
import { USER_ROLES, detectDevelopmentEnvironment, detectProdEnvironment } from "@mds/common";
import { Tooltip } from "antd";
import { useSelector } from "react-redux";
import { userHasRole } from "@mds/common/redux/reducers/authenticationReducer";
import { connect } from "react-redux";

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
 * NOTE: isMajorMine comes from `mine.major_mine_ind`, currently in MDS only Major mines can be updated,
 * therefore all edit buttons will be hidden from regional Mines -- Admin can view/edit everything
 *
 *
 * inDevelopment - If the feature is still being built and not ready to be shared with a larger audience, `inDevelopment` only displays the content in local and dev environment
 * inTesting - if the feature is ready to be shared with a larger audience, but not ready to be displayed in PROD, `inTesting` will display content in every environment except Prod.
 */

const propTypes = {
  permission: PropTypes.string,
  isMajorMine: PropTypes.bool,
  inDevelopment: PropTypes.bool,
  inTesting: PropTypes.bool,
  children: PropTypes.any,
  userRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  showToolTip: PropTypes.bool,
};

const defaultProps = {
  isMajorMine: undefined,
  inDevelopment: undefined,
  inTesting: undefined,
  permission: undefined,
  showToolTip: true,
  userRoles: [],
};

export const AuthorizationWrapper = (props) => {
  const inDevCheck =
    props.inDevelopment === undefined || (props.inDevelopment && detectDevelopmentEnvironment());
  const inTestCheck =
    props.inTesting === undefined || (props.inTesting && !detectProdEnvironment());
  const permissionCheck = useSelector((state) => userHasRole(state, props.permission));
  const isMajorMine = props.isMajorMine === undefined || props.isMajorMine;
  const isAdmin = useSelector((state) => userHasRole(state, USER_ROLES.role_admin));

  const title = () => {
    const permission = props.permission ? `${USER_ROLES[props.permission]}` : "";
    const inTest = props.inTesting ? "Not Visible in Production" : "";
    const majorMine = props.isMajorMine !== undefined ? "Only Visible to Major Mines" : "";
    return (
      <ul style={{ listStyle: "none", marginBottom: "0" }}>
        {permission && <li>{startCase(camelCase(permission))}</li>}
        {inTest && <li>{inTest}</li>}
        {majorMine && <li>{majorMine}</li>}
      </ul>
    );
  };

  // all actions are visible to admin, except when they should only exist in their respective environments. (ie admin cannot see features in prod if they are feature flagged to test)
  const adminOverride = isAdmin && !inDevCheck && !inTestCheck;
  return (
    (adminOverride || (inDevCheck && inTestCheck && permissionCheck && isMajorMine)) && (
      <Tooltip
        title={isAdmin && props.showToolTip ? title() : ""}
        placement="left"
        mouseEnterDelay={1.7}
        mouseLeaveDelay={0}
        arrowPointAtCenter
        overlayClassName="tooltip__admin"
        style={{ zIndex: 100000 }}
        trigger={["hover"]}
        destroyTooltipOnHide
      >
        {React.createElement("span", null, props.children)}
      </Tooltip>
    )
  );
};
AuthorizationWrapper.propTypes = propTypes;
AuthorizationWrapper.defaultProps = defaultProps;

export default connect()(AuthorizationWrapper);
