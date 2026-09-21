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
import { RECENT_SEARCHES_KEY, MAX_RECENT_SEARCHES } from "./GlobalSearch/utils/searchConfig";

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

  const saveRecentSearch = useCallback((term: string) => {
    if (!term.trim()) return;
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      const existing = stored ? JSON.parse(stored) : [];
      const updated = [term, ...existing.filter((s: string) => s !== term)].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  useEffect(() => {
    const parsedParams = queryString.parse(location.search);
    const { q, t } = parsedParams;
    if (q) {
      setParams({ q: q as string, t: t as string });
      // Don't show "*" in the search input - it's just used for "show all"
      setSearchInputValue(q === "*" ? "" : q as string);
      setIsSearching(true);
      if (q !== "*") {
        saveRecentSearch(q as string);
      }
      const { types, filters: enhancedFilters } = mapTabToSearchType(t as string, selectedFilters);
      const apiFilters = getFiltersForApi(enhancedFilters);
      dispatch(fetchSearchResults({ searchTerm: q as string, searchTypes: types, filters: apiFilters }));
    }
  }, [location.search, dispatch, mapTabToSearchType, getFiltersForApi, saveRecentSearch]);

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

  // Calculate total using facet counts when available (more accurate than capped array lengths)
  const typeFacets = searchFacets?.type || [];
  const partyTypeFacets = searchFacets?.party_type || [];
  
  const getFacetCount = (typeKey: string) => {
    const facet = typeFacets.find((f: any) => f.key === typeKey);
    return facet?.count || 0;
  };
  
  const getPartyTypeFacetCount = (typeKey: string) => {
    const facet = partyTypeFacets.find((f: any) => f.key === typeKey);
    return facet?.count || 0;
  };

  // Use facet counts if available, otherwise fall back to array lengths
  // Note: party_type facets use "Person"/"Organization" keys, not "PER"/"ORG"
  const facetCounts = {
    mine: getFacetCount('mine') || mines.length,
    party: getFacetCount('party') || parties.length,
    person: getPartyTypeFacetCount('Person') || peopleResults.length,
    organization: getPartyTypeFacetCount('Organization') || organizationResults.length,
    permit: getFacetCount('permit') || permits.length,
    explosives_permit: getFacetCount('explosives_permit') || explosivesPermits.length,
    now_application: getFacetCount('now_application') || nowApplications.length,
    notice_of_departure: getFacetCount('notice_of_departure') || nods.length,
    mine_documents: getFacetCount('mine_documents') || mineDocuments.length,
    permit_documents: getFacetCount('permit_documents') || permitDocuments.length,
  };

  // Calculate total: sum all type facets, but replace 'party' with person+organization to avoid double counting
  const totalResults = typeFacets.length > 0
    ? typeFacets.reduce((sum: number, f: any) => {
        // Skip 'party' since we count person and organization separately
        if (f.key === 'party') return sum;
        return sum + (f.count || 0);
      }, 0) + facetCounts.person + facetCounts.organization
    : mines.length + parties.length + permits.length + mineDocuments.length + permitDocuments.length +
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
      facetCounts,
    },
  };
};
