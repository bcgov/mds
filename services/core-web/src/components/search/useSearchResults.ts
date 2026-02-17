import { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useHistory } from "react-router-dom";
import queryString from "query-string";
import {
  selectSearchResults,
  selectSearchFacets,
  selectSearchOptions,
  fetchSearchOptions,
  fetchSearchResults,
} from "@mds/common/redux/slices/searchSlice";
import { getPartyRelationshipTypeHash } from "@mds/common/redux/selectors/staticContentSelectors";
import * as router from "@/constants/routes";

export interface SearchParams {
  q?: string;
  t?: string;
}

export const useSearchResults = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [params, setParams] = useState<SearchParams>({});
  const [searchInputValue, setSearchInputValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();

  const searchOptions = useSelector(selectSearchOptions);
  const searchResults = useSelector(selectSearchResults);
  const searchFacets = useSelector(selectSearchFacets);
  const partyRelationshipTypeHash = useSelector(getPartyRelationshipTypeHash);

  const highlightRegex = useMemo(() => {
    if (!params.q) return null;
    const escapedTerm = params.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    try {
      return new RegExp(escapedTerm, "i");
    } catch {
      return null;
    }
  }, [params.q]);

  const getFiltersForApi = useCallback((filters: Record<string, string[]>): Record<string, string> => {
    const apiFilters: Record<string, string> = {};
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        apiFilters[key] = values.join(",");
      }
    });
    return apiFilters;
  }, []);

  const mapTabToSearchType = useCallback((tabKey: string | undefined, currentFilters: Record<string, string[]>): { types: string[] | undefined; filters: Record<string, string[]> } => {
    if (!tabKey || tabKey === "all") return { types: undefined, filters: currentFilters };

    const tabToTypeMap: Record<string, string> = {
      "mine": "mine",
      "people": "party",
      "organization": "party",
      "permit": "permit",
      "explosives_permit": "explosives_permit",
      "now_application": "now_application",
      "notice_of_departure": "notice_of_departure",
      "document": "mine_documents,permit_documents",
    };

    const newFilters = { ...currentFilters };

    if (tabKey === "people") {
      newFilters.party_type = ["Person"];
    } else if (tabKey === "organization") {
      newFilters.party_type = ["Organization"];
    }

    const typeString = tabToTypeMap[tabKey];
    return {
      types: typeString ? typeString.split(",") : undefined,
      filters: newFilters
    };
  }, []);

  const triggerSearch = useCallback((searchTerm: string, searchTypes?: string, filters?: Record<string, string[]>) => {
    if (!searchTerm) return;
    setIsSearching(true);
    const { types, filters: enhancedFilters } = mapTabToSearchType(searchTypes, filters || {});
    const apiFilters = getFiltersForApi(enhancedFilters);
    dispatch(fetchSearchResults({ searchTerm, searchTypes: types, filters: apiFilters }));
  }, [dispatch, getFiltersForApi, mapTabToSearchType]);

  const onSearch = useCallback((value: string) => {
    if (value) {
      setSelectedFilters({});
      const newParams: Record<string, string | null> = { q: value };
      if (params.t) {
        newParams.t = params.t;
      }
      history.push(router.SEARCH_RESULTS.dynamicRoute(newParams));
    }
  }, [history, params.t]);

  const onTabChange = useCallback((key: string) => {
    const newParams = { q: params.q || "", t: key === "all" ? null : key };
    history.push(router.SEARCH_RESULTS.dynamicRoute(newParams));
  }, [history, params.q]);

  const handleFilterChange = useCallback((category: string, value: string, checked: boolean) => {
    const newFilters = { ...selectedFilters };
    const current = newFilters[category] || [];

    if (checked) {
      newFilters[category] = [...current, value];
    } else {
      const updated = current.filter((v) => v !== value);
      if (updated.length === 0) {
        delete newFilters[category];
      } else {
        newFilters[category] = updated;
      }
    }

    setSelectedFilters(newFilters);

    if (params.q) {
      triggerSearch(params.q, params.t, newFilters);
    }
  }, [selectedFilters, params.q, params.t, triggerSearch]);

  const clearAllFilters = useCallback(() => {
    setSelectedFilters({});
    if (params.q) {
      triggerSearch(params.q, params.t, {});
    }
  }, [params.q, params.t, triggerSearch]);

  useEffect(() => {
    if (!searchOptions.length) {
      dispatch(fetchSearchOptions(undefined));
    }
  }, [searchOptions.length, dispatch]);

  useEffect(() => {
    const parsedParams = queryString.parse(location.search);
    const { q, t } = parsedParams;
    if (q) {
      setParams({ q: q as string, t: t as string });
      setSearchInputValue(q as string);
      setIsSearching(true);
      const { types, filters: enhancedFilters } = mapTabToSearchType(t as string, selectedFilters);
      const apiFilters = getFiltersForApi(enhancedFilters);
      dispatch(fetchSearchResults({ searchTerm: q as string, searchTypes: types, filters: apiFilters }));
    }
  }, [location.search, dispatch, mapTabToSearchType, getFiltersForApi]);

  useEffect(() => {
    if (searchResults) {
      setIsSearching(false);
    }
  }, [searchResults]);

  // Process results
  const mines = searchResults?.mine || [];
  const parties = searchResults?.party || [];
  const permits = searchResults?.permit || [];
  const mineDocuments = searchResults?.mine_documents || [];
  const permitDocuments = searchResults?.permit_documents || [];
  const explosivesPermits = searchResults?.explosives_permit || [];
  const nowApplications = searchResults?.now_application || [];
  const nods = searchResults?.notice_of_departure || [];

  const mineResults = mines.map((item: any) => item.result).filter(Boolean);
  const partyResults = parties.map((item: any) => item.result).filter(Boolean);
  const peopleResults = partyResults.filter((p: any) => p?.party_type_code === "PER");
  const organizationResults = partyResults.filter((p: any) => p?.party_type_code === "ORG");
  const permitResults = permits.map((item: any) => item.result).filter(Boolean);
  const documentResults = [...mineDocuments, ...permitDocuments].map((item: any) => item.result).filter(Boolean);
  const explosivesPermitResults = explosivesPermits.map((item: any) => item.result).filter(Boolean);
  const nowApplicationResults = nowApplications.map((item: any) => item.result).filter(Boolean);
  const nodResults = nods.map((item: any) => item.result).filter(Boolean);

  const totalResults = mines.length + parties.length + permits.length + mineDocuments.length + permitDocuments.length +
    explosivesPermits.length + nowApplications.length + nods.length;

  const hasActiveFilters = Object.keys(selectedFilters).length > 0;

  return {
    isSearching,
    params,
    searchInputValue,
    setSearchInputValue,
    selectedFilters,
    searchFacets,
    partyRelationshipTypeHash,
    highlightRegex,
    onSearch,
    onTabChange,
    handleFilterChange,
    clearAllFilters,
    hasActiveFilters,
    results: {
      mines,
      mineResults,
      peopleResults,
      organizationResults,
      permitResults,
      documentResults,
      explosivesPermitResults,
      explosivesPermits,
      nowApplicationResults,
      nowApplications,
      nodResults,
      nods,
      totalResults,
    },
  };
};
