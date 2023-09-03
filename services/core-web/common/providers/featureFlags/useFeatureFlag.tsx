import { useContext } from "react";
import FeatureFlagContext from "./featureFlag.context";

const useFeatureFlag = () => {
  const context = useContext(FeatureFlagContext);

  if (!context) {
    throw new Error("useFeatureFlag must be used within a FeatureFlagContext");
  }

  return context;
};

export { useFeatureFlag };
