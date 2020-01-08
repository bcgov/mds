import React from "react";
import hoistNonReactStatics from "hoist-non-react-statics";
import NullScreen from "@/components/common/NullScreen";
import { detectDevelopmentEnvironment, detectProdEnvironment } from "@/utils/environmentUtils";

/**
 * @constant AuthorizationGuard - Higher Order Component that provides "feature flagging", in order to hide routes that
 * are not ready to be in PROD, pass in `inDevelopment` or 'inTesting` param to keep the content environment specific.
 */

export const AuthorizationGuard = (permission) => (WrappedComponent) => {
  const authorizationGuard = (props) => {
    if (
      (permission === "inDevelopment" && detectDevelopmentEnvironment()) ||
      (permission === "inTesting" && !detectProdEnvironment())
    ) {
      return <WrappedComponent {...props} />;
    }
    return <NullScreen type="unauthorized-page" />;
  };

  hoistNonReactStatics(authorizationGuard, WrappedComponent);

  return authorizationGuard;
};

export default AuthorizationGuard;
