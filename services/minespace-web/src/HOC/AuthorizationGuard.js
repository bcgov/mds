import React from "react";
import hoistNonReactStatics from "hoist-non-react-statics";
import UnauthenticatedNotice from "@/components/common/UnauthenticatedNotice";
import * as Permission from "@/constants/permissions";
import { detectDevelopmentEnvironment, detectProdEnvironment } from "@mds/common";

/**
 * @constant AuthorizationGuard - Higher Order Component that provides "feature flagging", in order to hide routes that
 * are not ready to be in PROD, pass in `inDevelopment` or 'inTesting` param to keep the content environment specific.
 */

export const AuthorizationGuard = (permission) => (WrappedComponent) => {
  const authorizationGuard = (props) => {
    if (
      (permission === Permission.IN_DEVELOPMENT && detectDevelopmentEnvironment()) ||
      (permission === Permission.IN_TESTING && !detectProdEnvironment())
    ) {
      return <WrappedComponent {...props} />;
    }
    return <UnauthenticatedNotice />;
  };

  hoistNonReactStatics(authorizationGuard, WrappedComponent);

  return authorizationGuard;
};

export default AuthorizationGuard;
