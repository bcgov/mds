import { PropTypes } from "prop-types";
import { connect } from "react-redux";
import { getUserAccessData } from "@common/selectors/authenticationSelectors";
import { USER_ROLES } from "@common/constants/environment";
import {
  detectDevelopmentEnvironment,
  detectProdEnvironment,
} from "@common/utils/environmentUtils";
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
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element.isRequired),
    PropTypes.element.isRequired,
  ]),
  userRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const defaultProps = {
  isMajorMine: undefined,
  inDevelopment: undefined,
  inTesting: undefined,
  permission: undefined,
};

export const AuthorizationWrapper = (props) => {
  const inDevCheck =
    props.inDevelopment === undefined || (props.inDevelopment && detectDevelopmentEnvironment());
  const inTestCheck =
    props.inTesting === undefined || (props.inTesting && !detectProdEnvironment());
  const permissionCheck =
    props.permission === undefined || props.userRoles.includes(USER_ROLES[props.permission]);
  const isMajorMine = props.isMajorMine === undefined || props.isMajorMine;
  const isAdmin = props.userRoles.includes(USER_ROLES[Permission.ADMIN]);

  return (
    (isAdmin || (inDevCheck && inTestCheck && permissionCheck && isMajorMine)) && props.children
  );
};
AuthorizationWrapper.propTypes = propTypes;
AuthorizationWrapper.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  userRoles: getUserAccessData(state),
});

export default connect(mapStateToProps)(AuthorizationWrapper);
