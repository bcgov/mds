import React from "react";
import { PropTypes } from "prop-types";
import { connect } from "react-redux";
import { getUserAccessData } from "@/selectors/authenticationSelectors";
import { USER_ROLES } from "@/constants/environment";
import * as Permission from "@/constants/permissions";

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
 */

const propTypes = {
  permission: PropTypes.string.isRequired,
  isMajorMine: PropTypes.bool,
  children: PropTypes.element.isRequired,
};

const defaultProps = {
  isMajorMine: true,
};
export const AuthorizationWrapper = ({ children: Children, ...props }) =>
  props.userRoles.includes(USER_ROLES[props.permission]) &&
  (props.isMajorMine || props.userRoles.includes(USER_ROLES[Permission.ADMIN])) && (
    <div>{Children}</div>
  );

AuthorizationWrapper.propTypes = propTypes;
AuthorizationWrapper.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  userRoles: getUserAccessData(state),
});

export default connect(mapStateToProps)(AuthorizationWrapper);
