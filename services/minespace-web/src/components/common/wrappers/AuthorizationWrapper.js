import React from "react";
import { PropTypes } from "prop-types";
import { connect } from "react-redux";
import { detectDevelopmentEnvironment, detectProdEnvironment } from "@mds/common";
import { isProponent, isAuthenticated } from "@/selectors/authenticationSelectors";

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
 * isProponent - This prop comes directly from the store, only MineSpace proponents have access to create anything, CORE users are view only
 */

const propTypes = {
  inDevelopment: PropTypes.bool,
  inTesting: PropTypes.bool,
  isProponent: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element.isRequired),
    PropTypes.element.isRequired,
  ]),
};

const defaultProps = {
  inDevelopment: undefined,
  isProponent: undefined,
  inTesting: undefined,
  children: undefined,
};

export const AuthorizationWrapper = (props) => {
  const checkDev = props.inDevelopment && detectDevelopmentEnvironment();
  const checkTest = props.inTesting && !detectProdEnvironment();
  // do not show any actions if the user is not a proponents,
  // Allowing IDIR users, especially in dev, to do tasks that are specific to the role "minespace_proponent" can have unintended side effects
  // Use BCeID credentials to access actions
  if (!props.isProponent) {
    return <span />;
  }
  if (props.inDevelopment === undefined && props.inTesting === undefined) {
    return React.createElement("span", null, props.children);
  }
  if (checkDev || checkTest) {
    return React.createElement("span", null, props.children);
  }
  return <span />;
};

const mapStateToProps = (state) => ({
  isProponent: isProponent(state),
  isAuthenticated: isAuthenticated(state),
});

AuthorizationWrapper.propTypes = propTypes;
AuthorizationWrapper.defaultProps = defaultProps;

export default connect(mapStateToProps)(AuthorizationWrapper);
