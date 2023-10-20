import React from "react";
import hoistNonReactStatics from "hoist-non-react-statics";
import { Feature } from "@mds/common";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import NullScreen from "./NullScreen";

/**
 * @constant FeatureFlagGuard - Higher Order Component that provides "feature flagging", in order to hide routes that
 * should not be accessible based on a feature flag
 */
export const FeatureFlagGuard = (feature: Feature) => (WrappedComponent) => {
  const featureFlagGuard = (props) => {
    const { isFeatureEnabled } = useFeatureFlag();

    if (isFeatureEnabled(feature)) {
      return <WrappedComponent {...props} />;
    }

    return <NullScreen type="unauthorized-page" />;
  };

  hoistNonReactStatics(featureFlagGuard, WrappedComponent);

  return featureFlagGuard;
};

export default FeatureFlagGuard;
