import React from "react";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils/featureFlag";
import SearchResultsV2 from "./SearchResultsV2";
import SearchResultsLegacy from "./SearchResultsLegacy";

const SearchResults: React.FC<any> = (props) => {
  const { isFeatureEnabled } = useFeatureFlag();

  if (isFeatureEnabled(Feature.GLOBAL_SEARCH_V2)) {
    return <SearchResultsV2 />;
  }

  return <SearchResultsLegacy {...props} />;
};

export default SearchResults;
