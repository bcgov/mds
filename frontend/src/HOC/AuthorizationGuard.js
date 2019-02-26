import React from "react";
import { connect } from "react-redux";
import hoistNonReactStatics from "hoist-non-react-statics";
import { getUserAccessData } from "@/selectors/authenticationSelectors";
import { USER_ROLES } from "@/constants/environment";
import NullScreen from "@/components/common/NullScreen";
import { detectDevelopmentEnvironment, detectProdEnvironment } from "@/utils/environmentUtils";

/**
 * @constant AuthorizationGuard - Higher Order Component that checks if user has the has the correct permission, if so, render component, else render a NullScreen.
 * NOTE: feature flagging, in order to hide routes that Are not ready to be in PROD, pass in `inDevelopment` or 'inTesting` param to keep the content environment specific.
 */

export const AuthorizationGuard = (permission) => (WrappedComponent) => {
  const authorizationGuard = (props) => {
    if (props.userRoles.includes(USER_ROLES[permission])) {
      return <WrappedComponent {...props} />;
    }
    if (
      (permission === "inDevelopment" && detectDevelopmentEnvironment()) ||
      (permission === "inTesting" && !detectProdEnvironment())
    ) {
      return <WrappedComponent {...props} />;
    }
    return <NullScreen type="unauthorized-page" />;
  };

  hoistNonReactStatics(authorizationGuard, WrappedComponent);

  const mapStateToProps = (state) => ({
    userRoles: getUserAccessData(state),
  });

  return connect(mapStateToProps)(authorizationGuard);
};

export default AuthorizationGuard;
