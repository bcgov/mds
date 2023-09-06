import React, { useCallback, useEffect, useState } from "react";
import FeatureFlagContext from "./featureFlag.context";
import { initializeFlagsmith, isFeatureEnabled } from "@mds/common";
import { ENVIRONMENT } from "@mds/common";
import flagsmith from "flagsmith";

const FeatureFlagProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await initializeFlagsmith(ENVIRONMENT.flagsmithUrl, ENVIRONMENT.flagsmithKey);
      setIsLoading(false);
    })();
  }, [ENVIRONMENT._loaded]);

  const checkFeatureFlag = useCallback((feature) => isFeatureEnabled(feature), [flagsmith]);

  return (
    <FeatureFlagContext.Provider
      value={{
        isLoading,
        isFeatureEnabled: checkFeatureFlag,
      }}
    >
      {children}
    </FeatureFlagContext.Provider>
  );
};

export default FeatureFlagProvider;
