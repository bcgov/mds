import { PropTypes } from "prop-types";
import { detectDevelopmentEnvironment, detectProdEnvironment } from "@/utils/environmentUtils";

/**
 * @constant AuthorizationWrapper conditionally renders react children depending
 * if the role passed in matches the user permissions.
 *
 * NOTE: If the childComponent is an ant design child component**
 * IE. Menu.Item,
 * <Menu>
 *    <Menu.Item />
 * </Menu>
 * The implicit flow of passing props down to children could be interrupted.
 * Ie, Menu passes onItemHover down to Menu.Item, with AuthorizationWrapper wrapping Menu.Item, it no longer has access
 * to onItemHover, as a solution, a <div className="custom-menu-item" /> will be used in place of Menu.Item and will inherit all CSS from
 * Menu.Item.
 * Use case example:
 * <Menu>
    <AuthorizationWrapper inDevelopment={true}>
      <div className="custom-menu-item">
        <Button>
          Dev-Only Button
        </Button>
      </div>
    </AuthorizationWrapper>
  </Menu>
 *
 * inDevelopment - if the feature is still being built and not ready to be shared with a larger audience, `inDevelopment` only displays the content in local and dev environment
 * inTesting - if the feature is ready to be shared with a larger audience, but not ready to be displayed in PROD, `inTesting` will display content in every environment except Prod.
 */

const propTypes = {
  inDevelopment: PropTypes.bool,
  inTesting: PropTypes.bool,
  children: PropTypes.element.isRequired,
};

const defaultProps = {
  inDevelopment: false,
  inTesting: false,
};

export const AuthorizationWrapper = (props) =>
  ((props.inDevelopment && detectDevelopmentEnvironment()) ||
    (props.inTesting && !detectProdEnvironment())) &&
  props.children;

AuthorizationWrapper.propTypes = propTypes;
AuthorizationWrapper.defaultProps = defaultProps;

export default AuthorizationWrapper;
