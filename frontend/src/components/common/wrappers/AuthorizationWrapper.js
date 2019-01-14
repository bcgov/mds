import React from "react";
import { PropTypes } from "prop-types";
import { connect } from "react-redux";
import { getUserAccessData } from "@/selectors/authenticationSelectors";
import { USER_ROLES } from "@/constants/environment";

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
 *
 */

const propTypes = {
  permission: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
};

export const AuthorizationWrapper = (props) =>
  props.userRoles.includes(USER_ROLES[props.permission]) && <div>{...props.children}</div>;

AuthorizationWrapper.propTypes = propTypes;

const mapStateToProps = (state) => ({
  userRoles: getUserAccessData(state),
});

export default connect(mapStateToProps)(AuthorizationWrapper);
