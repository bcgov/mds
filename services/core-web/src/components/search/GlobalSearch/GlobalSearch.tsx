import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { Modal, Input, Typography, Button, List, Space, Row, Divider, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { fetchSearchBarResults, selectSearchBarResults, selectSearchBarFacets } from "@mds/common/redux/slices/searchSlice";
import * as router from "@/constants/routes";
import { ISearchResult, ISimpleSearchResult } from "@mds/common/interfaces";
import { SearchTriggerButton } from "./components/SearchTriggerButton";
import { SearchFilters } from "./components/SearchFilters";
import { SearchResultItem } from "./components/SearchResultItem";
import { RecentSearches } from "./components/RecentSearches";
import { EmptySearchState } from "./components/EmptySearchState";
import { useRecentSearches } from "./hooks/useRecentSearches";
import { SEARCH_TYPE_CONFIG, RESULT_TYPE_MAP } from "./utils/searchConfig";
import { getSearchTypes, extractMineGuidFromPath } from "./utils/searchHelpers";

const { Text } = Typography;

interface GlobalSearchProps {
  placeholder?: string;
  size?: "small" | "middle" | "large";
  enableShortcut?: boolean;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({
  placeholder = "Search Core...",
  enableShortcut = true,
  size,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [scopeToMine, setScopeToMine] = useState(false);
  const [quickFilter, setQuickFilter] = useState<string | null>(null);

  const dispatch = useDispatch();
  const searchResults = useSelector(selectSearchBarResults);
  const facets = useSelector(selectSearchBarFacets);
  const history = useHistory();
  const location = useLocation();
  const inputRef = useRef<any>(null);

  const currentMineGuid = useMemo(() => extractMineGuidFromPath(location.pathname), [location.pathname]);
  const isOnMinePage = !!currentMineGuid;

  const { recentSearches, saveRecentSearch, removeRecentSearch } = useRecentSearches();

  const handleSearch = useCallback(
    (term: string, filters: string[], mineGuid: string | null) => {
      const effectiveTerm = term || "*";
      if (effectiveTerm.length > 0) {
        const derivedTypes = getSearchTypes(filters, quickFilter);
        // If no filters are selected, explicitly send all search types to allow 1-char search
        const allTypes = Object.values(SEARCH_TYPE_CONFIG).flatMap((c) => c.types);

        dispatch(fetchSearchBarResults({
          searchTerm: effectiveTerm,
          searchTypes: derivedTypes || allTypes,
          mineGuid
        }));
      }
    },
    [dispatch, quickFilter]
  );

  const handleOpen = () => {
    setIsModalVisible(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleClose = useCallback(() => {
    setIsModalVisible(false);
    setSearchTerm("");
    setSelectedIndex(0);
    setActiveFilters([]);
    setScopeToMine(false);
    setQuickFilter(null);
  }, []);

  useEffect(() => {
    if (!enableShortcut) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const isAnyModalOpen = document.querySelector(".global-search-modal");

        if (isModalVisible) {
          handleClose();
        } else if (!isAnyModalOpen) {
          handleOpen();
        }
      }
    };
    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [isModalVisible, handleClose, enableShortcut]);

  const getMineGuidForSearch = () => (scopeToMine && currentMineGuid ? currentMineGuid : null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setSearchTerm(value);
    setSelectedIndex(0);
    if (value.length > 0) {
      handleSearch(value, activeFilters, getMineGuidForSearch());
    }
  };

  const toggleFilter = (filterKey: string) => {
    const newFilters = activeFilters.includes(filterKey)
      ? activeFilters.filter((f) => f !== filterKey)
      : [...activeFilters, filterKey];
    setActiveFilters(newFilters);
    setSelectedIndex(0);
    if (searchTerm.length > 0 || newFilters.length > 0) {
      handleSearch(searchTerm, newFilters, getMineGuidForSearch());
    }
  };

  const toggleScopeToMine = (checked: boolean) => {
    setScopeToMine(checked);
    const mineGuid = checked && currentMineGuid ? currentMineGuid : null;
    const term = searchTerm || "*";
    handleSearch(term, activeFilters, mineGuid);
  };

  const navigateToResult = (item: ISearchResult<ISimpleSearchResult>) => {
    saveRecentSearch(item.result.value);
    let routeUrl = "";
    switch (item.type) {
      case "mine":
        routeUrl = router.MINE_GENERAL.dynamicRoute(item.result.id);
        break;
      case "person":
      case "organization":
      case "party":
        routeUrl = router.PARTY_PROFILE.dynamicRoute(item.result.id);
        break;
      case "now_application":
        routeUrl = router.NOTICE_OF_WORK_APPLICATION.dynamicRoute(item.result.id, "verification");
        break;
      case "permit":
        routeUrl = router.VIEW_MINE_PERMIT.dynamicRoute(item.result.mine_guid, item.result.id);
        break;
      case "explosives_permit":
        routeUrl = router.MINE_PERMITS.dynamicRoute(item.result.mine_guid);
        break;
      case "nod":
        routeUrl = router.NOTICE_OF_DEPARTURE.dynamicRoute(item.result.mine_guid, item.result.id);
        break;
    }
    if (routeUrl) {
      handleClose();
      history.push(routeUrl);
    }
  };

  const handleEnter = () => {
    if (searchResults?.length > 0) {
      navigateToResult(searchResults[selectedIndex]);
    } else if (searchTerm.length > 0) {
      saveRecentSearch(searchTerm);
      handleClose();
      history.push(router.SEARCH_RESULTS.dynamicRoute({ q: searchTerm }));
    }
  };

  const handleRecentSearchClick = (term: string) => {
    setSearchTerm(term);
    handleSearch(term, activeFilters, getMineGuidForSearch());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = searchResults?.length || recentSearches.length || 0;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (totalItems || 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (totalItems || 1)) % (totalItems || 1));
        break;
      case "Enter":
        e.preventDefault();
        if (!searchTerm && recentSearches.length > 0) {
          handleRecentSearchClick(recentSearches[selectedIndex]);
        } else {
          handleEnter();
        }
        break;
      case "Escape":
        handleClose();
        break;
      case "Backspace":
        if (searchTerm === "" && quickFilter) {
          e.preventDefault();
          setQuickFilter(null);
        }
        break;
    }
  };

  const groupedResults = useMemo(() => {
    if (!searchResults?.length) return null;
    const groups: Record<string, ISearchResult<ISimpleSearchResult>[]> = {};
    searchResults.forEach((result) => {
      if (!groups[result.type]) groups[result.type] = [];
      groups[result.type].push(result);
    });
    return groups;
  }, [searchResults]);

  const handleViewAll = () => {
    saveRecentSearch(searchTerm);
    handleClose();
    history.push(router.SEARCH_RESULTS.dynamicRoute({ q: searchTerm }));
  };

  const handleQuickAction = (route: string) => {
    handleClose();
    history.push(route);
  };

  const renderResults = () => {
    const hasActiveSearch = searchTerm || scopeToMine || activeFilters.length > 0;

    if (hasActiveSearch && groupedResults) {
      let globalIndex = 0;
      return (
        <div className="global-search-results">
          {Object.entries(groupedResults).map(([type, results]) => {
            const configKey = RESULT_TYPE_MAP[type] || "document";
            const config = SEARCH_TYPE_CONFIG[configKey];
            return (
              <div key={type}>
                <Divider style={{ margin: "0" }} orientation="left" plain className="global-search-results__section-divider">
                  {config.pluralLabel}
                </Divider>
                <List
                  dataSource={results}
                  renderItem={(item) => (
                    <SearchResultItem
                      key={`${item.type}-${item.result.id}`}
                      item={item}
                      index={globalIndex++}
                      selectedIndex={selectedIndex}
                      searchTerm={searchTerm}
                      onClick={navigateToResult}
                      onMouseEnter={setSelectedIndex}
                    />
                  )}
                  split={false}
                />
              </div>
            );
          })}
          <div className="global-search-results__view-all">
            <Button type="link" block onClick={handleViewAll} className="global-search-results__view-all-btn">
              View all results for "{searchTerm}"
            </Button>
          </div>
        </div>
      );
    }

    if (hasActiveSearch && searchResults?.length === 0) {
      return (
        <EmptySearchState
          hasSearchTerm={true}
          scopeToMine={scopeToMine}
          activeFiltersCount={activeFilters.length}
          searchTerm={searchTerm}
          onViewAll={handleViewAll}
        />
      );
    }

    if (!hasActiveSearch && recentSearches.length > 0) {
      return (
        <RecentSearches
          recentSearches={recentSearches}
          selectedIndex={selectedIndex}
          onSearchClick={handleRecentSearchClick}
          onRemoveSearch={(term, e) => {
            e.stopPropagation();
            removeRecentSearch(term);
          }}
          onSetSelectedIndex={setSelectedIndex}
        />
      );
    }

    return (
      <EmptySearchState
        hasSearchTerm={false}
        scopeToMine={scopeToMine}
        activeFiltersCount={activeFilters.length}
        onQuickAction={handleQuickAction}
        quickActions={[
          {
            icon: <SearchOutlined />,
            label: "Browse Mines",
            color: "#2e7d32",
            route: router.MINE_HOME_PAGE.dynamicRoute({ page: "1", per_page: "25" }),
          },
          {
            icon: <SearchOutlined />,
            label: "Browse Contacts",
            color: "#1565c0",
            route: router.CONTACT_HOME_PAGE.dynamicRoute({ page: "1", per_page: "25" }),
          },
          {
            icon: <SearchOutlined />,
            label: "Reports",
            color: "#7b1fa2",
            route: router.REPORTING_DASHBOARD.route,
          },
        ]}
      />
    );
  };

  return (
    <>
      <SearchTriggerButton
        onClick={handleOpen}
        placeholder={placeholder}
        size={size}
        enableShortcut={enableShortcut}
      />

      <Modal
        open={isModalVisible}
        onCancel={handleClose}
        footer={
          <Row justify="space-between" className="global-search-modal__footer">
            <Space size="middle">
              <span>
                <Text keyboard>↵</Text> select
              </span>
              <span>
                <Text keyboard>↑↓</Text> navigate
              </span>
              <span>
                <Text keyboard>esc</Text> close
              </span>
            </Space>
          </Row>
        }
        closable={false}
        maskClosable
        keyboard
        width={580}
        style={{ top: 80 }}
        bodyStyle={{ padding: 0 }}
        className="global-search-modal"
        destroyOnClose
      >
        <Input
          ref={inputRef}
          prefix={
            <Space size={4}>
              <SearchOutlined className="search-icon" />
              {quickFilter && (
                <Tag
                  color="blue"
                  closable
                  onClose={(e) => {
                    e.preventDefault();
                    setQuickFilter(null);
                  }}
                  className="search-tag-icon"
                >
                  {SEARCH_TYPE_CONFIG[quickFilter]?.icon}
                  <span className="search-type-label">{SEARCH_TYPE_CONFIG[quickFilter]?.pluralLabel || quickFilter}</span>
                </Tag>
              )}
            </Space>
          }
          placeholder={
            quickFilter
              ? "Search within filter..."
              : "Search for mines, contacts, permits..."
          }
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          bordered={false}
          allowClear
          size="large"
          className="global-search-modal__input"
        />
        <SearchFilters
          activeFilters={activeFilters}
          onToggleFilter={toggleFilter}
          facets={facets}
          isOnMinePage={isOnMinePage}
          scopeToMine={scopeToMine}
          onToggleScopeToMine={toggleScopeToMine}
          searchTerm={searchTerm}
        />
        {renderResults()}
      </Modal>
    </>
  );
};

export default GlobalSearch;
