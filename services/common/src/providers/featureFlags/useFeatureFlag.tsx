import { useContext } from "react";
import FeatureFlagContext from "./featureFlag.context";

const useFeatureFlag = () => {
  const context = useContext(FeatureFlagContext);

  return context;
};

export { useFeatureFlag };
