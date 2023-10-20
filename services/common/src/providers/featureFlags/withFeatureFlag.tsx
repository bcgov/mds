import React from "react";
import { useFeatureFlag } from "./useFeatureFlag";
const withFeatureFlag = (Component) => {
  return function WrappedComponent(props) {
    const { isFeatureEnabled } = useFeatureFlag();

    return <Component {...props} isFeatureEnabled={isFeatureEnabled} />;
  };
};

export default withFeatureFlag;
