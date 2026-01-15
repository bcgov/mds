import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { Modal, Input, Typography, Button, List, Space, Row, Col, Avatar, Divider, Tag, Switch } from "antd";
import { AimOutlined } from "@ant-design/icons";
import {
  SearchOutlined,
  FileSearchOutlined,
  EnterOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  FileProtectOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  HistoryOutlined,
  UserOutlined,
  BankOutlined,
  ExceptionOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import { fetchSearchBarResults } from "@mds/common/redux/actionCreators/searchActionCreator";
import { getSearchBarResults, getSearchBarFacets } from "@mds/common/redux/reducers/searchReducer";
import * as router from "@/constants/routes";
import { ISearchResult, ISimpleSearchResult } from "@mds/common/interfaces";

const { Text, Title } = Typography;

const RECENT_SEARCHES_KEY = "mds_recent_searches";
const MAX_RECENT_SEARCHES = 5;

interface GlobalSearchProps {
  placeholder?: string;
  size?: "small" | "middle" | "large";
  enableShortcut?: boolean;
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string; types: string[] }> = {
  mine: { icon: <EnvironmentOutlined />, label: "Mines", color: "#2e7d32", types: ["mine"] },
  contact: { icon: <UserOutlined />, label: "People", color: "#1565c0", types: ["person", "party"] },
  organization: { icon: <BankOutlined />, label: "Organizations", color: "#f57c00", types: ["organization"] },
  permit: { icon: <FileProtectOutlined />, label: "Permits", color: "#e65100", types: ["permit"] },
  explosives_permit: { icon: <AlertOutlined />, label: "Explosives", color: "#d32f2f", types: ["explosives_permit"] },
  now_application: { icon: <FileSearchOutlined />, label: "NoW", color: "#0288d1", types: ["now_application"] },
  nod: { icon: <ExceptionOutlined />, label: "NODs", color: "#7b1fa2", types: ["nod", "notice_of_departure"] },
  document: { icon: <FileSearchOutlined />, label: "Documents", color: "#455a64", types: ["mine_documents", "permit_documents"] },
};

const RESULT_TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  mine: { icon: <EnvironmentOutlined />, label: "Mine", color: "#2e7d32" },
  person: { icon: <UserOutlined />, label: "Person", color: "#1565c0" },
  organization: { icon: <BankOutlined />, label: "Organization", color: "#f57c00" },
  party: { icon: <TeamOutlined />, label: "Contact", color: "#1565c0" },
  permit: { icon: <FileProtectOutlined />, label: "Permit", color: "#e65100" },
  explosives_permit: { icon: <AlertOutlined />, label: "Explosives Permit", color: "#d32f2f" },
  now_application: { icon: <FileSearchOutlined />, label: "Notice of Work", color: "#0288d1" },
  nod: { icon: <ExceptionOutlined />, label: "NOD", color: "#7b1fa2" },
  notice_of_departure: { icon: <ExceptionOutlined />, label: "NOD", color: "#7b1fa2" },
  mine_documents: { icon: <FileSearchOutlined />, label: "Document", color: "#455a64" },
  permit_documents: { icon: <FileSearchOutlined />, label: "Document", color: "#455a64" },
};

const COMMANDS: Record<string, { action: string; description: string; aliases: string[] }> = {
  mine: { action: "filter:mine", description: "Toggle Mines filter", aliases: ["mines", "m"] },
  contact: { action: "filter:contact", description: "Toggle People filter", aliases: ["contacts", "people", "person", "p"] },
  organization: { action: "filter:organization", description: "Toggle Organizations filter", aliases: ["organizations", "orgs", "org", "o"] },
  permit: { action: "filter:permit", description: "Toggle Permits filter", aliases: ["permits"] },
  explosives: { action: "filter:explosives_permit", description: "Toggle Explosives filter", aliases: ["explosives_permit", "exp", "e"] },
  now: { action: "filter:now_application", description: "Toggle Notice of Work filter", aliases: ["now_application", "notice", "work"] },
  nod: { action: "filter:nod", description: "Toggle NODs filter", aliases: ["nods", "n"] },
  document: { action: "filter:document", description: "Toggle Documents filter", aliases: ["documents", "docs", "doc", "d"] },
  here: { action: "scope:mine", description: "Toggle scope to current mine", aliases: ["this", "scope"] },
  clear: { action: "clear:filters", description: "Clear all filters", aliases: ["reset", "c"] },
};

const GlobalSearch: React.FC<GlobalSearchProps> = ({ placeholder = "Search Core...", enableShortcut = true }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [scopeToMine, setScopeToMine] = useState(false);
  const [commandMode, setCommandMode] = useState(false);
  const [commandInput, setCommandInput] = useState("");
  const [quickFilter, setQuickFilter] = useState<string | null>(null); // Filter applied via shortcut

  const dispatch = useDispatch();
  const searchResults = useSelector(getSearchBarResults);
  const facets = useSelector(getSearchBarFacets);
  const history = useHistory();
  const location = useLocation();
  const inputRef = useRef<any>(null);

  // Extract mine_guid from URL if on a mine page
  const currentMineGuid = useMemo(() => {
    const match = location.pathname.match(/\/mine-dashboard\/([a-f0-9-]+)/i);
    return match ? match[1] : null;
  }, [location.pathname]);

  const isOnMinePage = !!currentMineGuid;

  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== term);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

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
    setCommandMode(false);
    setCommandInput("");
    setQuickFilter(null);
  }, []);

  useEffect(() => {
    if (!enableShortcut) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        
        // Check if any global search modal is already open
        const isAnyModalOpen = document.querySelector('.global-search-modal');
        
        if (isModalVisible) {
          handleClose();
        } else if (!isAnyModalOpen) {
          handleOpen();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalVisible, handleClose, enableShortcut]);

  const getSearchTypes = (filters: string[], includeQuickFilter?: string | null) => {
    const allFilters = includeQuickFilter ? [...filters, includeQuickFilter] : filters;
    const uniqueFilters = [...new Set(allFilters)];
    if (uniqueFilters.length === 0) return null;
    return uniqueFilters.flatMap((f) => TYPE_CONFIG[f]?.types || []);
  };

  const getMineGuidForSearch = () => scopeToMine && currentMineGuid ? currentMineGuid : null;

  const findCommand = (input: string): { key: string; command: typeof COMMANDS[string] } | null => {
    const cmd = input.toLowerCase().trim();
    for (const [key, command] of Object.entries(COMMANDS)) {
      if (key === cmd || command.aliases.includes(cmd)) {
        return { key, command };
      }
    }
    return null;
  };

  const getMatchingCommands = (input: string) => {
    const cmd = input.toLowerCase().trim();
    if (!cmd) return Object.entries(COMMANDS);
    return Object.entries(COMMANDS).filter(([key, command]) =>
      key.startsWith(cmd) || command.aliases.some(a => a.startsWith(cmd))
    );
  };

  const executeCommand = (action: string, followUpSearch?: string) => {
    const [type, target] = action.split(":");
    let newFilters = activeFilters;
    let newScopeToMine = scopeToMine;

    if (type === "filter") {
      newFilters = activeFilters.includes(target)
        ? activeFilters.filter((f) => f !== target)
        : [...activeFilters, target];
      setActiveFilters(newFilters);
    } else if (type === "scope" && isOnMinePage) {
      newScopeToMine = !scopeToMine;
      setScopeToMine(newScopeToMine);
    } else if (type === "clear") {
      newFilters = [];
      newScopeToMine = false;
      setActiveFilters([]);
      setScopeToMine(false);
    }

    setCommandMode(false);
    setCommandInput("");
    setSelectedIndex(0);

    // If there's a follow-up search term, set it and trigger search
    if (followUpSearch && followUpSearch.trim()) {
      const term = followUpSearch.trim();
      setSearchTerm(term);
      const mineGuid = newScopeToMine && currentMineGuid ? currentMineGuid : null;
      dispatch(fetchSearchBarResults(term, getSearchTypes(newFilters), mineGuid));
    } else if (searchTerm) {
      // Re-run existing search with new filters
      const mineGuid = newScopeToMine && currentMineGuid ? currentMineGuid : null;
      dispatch(fetchSearchBarResults(searchTerm, getSearchTypes(newFilters), mineGuid));
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Check if input starts with / - this means command mode
    if (value.startsWith("/")) {
      if (!commandMode) {
        setCommandMode(true);
      }

      const cmdContent = value.slice(1); // Everything after /
      const { commandPart, searchPart } = parseCommandInput(cmdContent);

      // Auto-apply filter: if user just typed a space and there's a matching command
      if (cmdContent.endsWith(" ") && !searchPart && commandPart) {
        const matchingCommands = getMatchingCommands(commandPart.trim());
        if (matchingCommands.length > 0) {
          const action = matchingCommands[0][1].action;
          // Only set quickFilter for filter commands
          if (action.startsWith("filter:")) {
            const filterKey = action.split(":")[1];
            setQuickFilter(filterKey);
            setCommandMode(false);
            setCommandInput("");
            setSearchTerm("");
            setTimeout(() => inputRef.current?.focus(), 0);
            return;
          } else if (action === "scope:mine" && isOnMinePage) {
            setScopeToMine(true);
            setCommandMode(false);
            setCommandInput("");
            setSearchTerm("");
            setTimeout(() => inputRef.current?.focus(), 0);
            return;
          } else if (action === "clear:filters") {
            setActiveFilters([]);
            setQuickFilter(null);
            setScopeToMine(false);
            setCommandMode(false);
            setCommandInput("");
            setSearchTerm("");
            setTimeout(() => inputRef.current?.focus(), 0);
            return;
          }
        }
      }

      setCommandInput(cmdContent);
      setSelectedIndex(0);
      return;
    }

    // If we were in command mode but / is gone, exit command mode
    if (commandMode) {
      setCommandMode(false);
      setCommandInput("");
    }

    setSearchTerm(value);
    setSelectedIndex(0);
    if (value.length > 0) {
      dispatch(fetchSearchBarResults(value, getSearchTypes(activeFilters, quickFilter), getMineGuidForSearch()));
    }
  };

  const toggleFilter = (filterKey: string) => {
    const newFilters = activeFilters.includes(filterKey)
      ? activeFilters.filter((f) => f !== filterKey)
      : [...activeFilters, filterKey];
    setActiveFilters(newFilters);
    setSelectedIndex(0);
    if (searchTerm.length > 0) {
      dispatch(fetchSearchBarResults(searchTerm, getSearchTypes(newFilters, quickFilter), getMineGuidForSearch()));
    }
  };

  const toggleScopeToMine = (checked: boolean) => {
    setScopeToMine(checked);
    const mineGuid = checked && currentMineGuid ? currentMineGuid : null;
    // Trigger search immediately - use "*" as wildcard if no search term
    const term = searchTerm || "*";
    dispatch(fetchSearchBarResults(term, getSearchTypes(activeFilters, quickFilter), mineGuid));
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
    dispatch(fetchSearchBarResults(term, getSearchTypes(activeFilters, quickFilter), getMineGuidForSearch()));
  };

  const parseCommandInput = (input: string): { commandPart: string; searchPart: string } => {
    const spaceIndex = input.indexOf(" ");
    if (spaceIndex === -1) {
      return { commandPart: input, searchPart: "" };
    }
    return {
      commandPart: input.slice(0, spaceIndex),
      searchPart: input.slice(spaceIndex + 1)
    };
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (commandMode) {
      const { commandPart, searchPart } = parseCommandInput(commandInput);
      const matchingCommands = getMatchingCommands(commandPart);
      const totalCommands = matchingCommands.length;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % (totalCommands || 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + (totalCommands || 1)) % (totalCommands || 1));
          break;
        case "Enter":
          e.preventDefault();
          if (matchingCommands.length > 0) {
            executeCommand(matchingCommands[selectedIndex][1].action, searchPart);
          }
          break;
        case "Tab":
          e.preventDefault();
          // Tab autocompletes the command but keeps the search part
          if (matchingCommands.length > 0) {
            const selectedCmd = matchingCommands[selectedIndex][0];
            setCommandInput(selectedCmd + " " + searchPart);
          }
          break;
        case "Escape":
          e.preventDefault();
          setCommandMode(false);
          setCommandInput("");
          setSearchTerm("");
          break;
      }
      return;
    }

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
        // Clear quickFilter when backspacing with empty input
        if (searchTerm === "" && quickFilter) {
          e.preventDefault();
          setQuickFilter(null);
        }
        break;
    }
  };

  const highlightMatch = (text: string, search: string) => {
    if (!search || !text) return text;
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) => (regex.test(part) ? <mark key={i}>{part}</mark> : part));
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

  const renderResultItem = (item: ISearchResult<ISimpleSearchResult>, index: number) => {
    const config = RESULT_TYPE_CONFIG[item.type] || { icon: <FileSearchOutlined />, label: item.type, color: "#8c8c8c" };
    const isSelected = index === selectedIndex;

    return (
      <List.Item
        key={`${item.type}-${item.result.id}`}
        className={`global-search__result-item ${isSelected ? "global-search__result-item--selected" : ""}`}
        onClick={() => navigateToResult(item)}
        onMouseEnter={() => setSelectedIndex(index)}
      >
        <List.Item.Meta
          avatar={
            <Avatar
              icon={config.icon}
              style={{ backgroundColor: `${config.color}20`, color: config.color }}
            />
          }
          title={<Text strong={isSelected}>{highlightMatch(item.result.value, searchTerm)}</Text>}
          description={
            <Text type="secondary">
              {config.label}
              {item.result.description && <span style={{ marginLeft: 8 }}>• {item.result.description}</span>}
              {item.result.highlight && (
                <span
                  style={{ marginLeft: 8, fontStyle: "italic" }}
                  dangerouslySetInnerHTML={{ __html: `• ${item.result.highlight}` }}
                />
              )}
            </Text>
          }
        />
        {isSelected && <EnterOutlined style={{ color: "#5e46a1" }} />}
      </List.Item>
    );
  };

  const getFacetCount = (filterKey: string): number => {
    if (filterKey === "mine") return facets.mine ?? 0;
    if (filterKey === "contact") return facets.person ?? 0;
    if (filterKey === "organization") return facets.organization ?? 0;
    if (filterKey === "permit") return facets.permit ?? 0;
    if (filterKey === "explosives_permit") return facets.explosives_permit ?? 0;
    if (filterKey === "now_application") return facets.now_application ?? 0;
    if (filterKey === "nod") return facets.nod ?? 0;
    if (filterKey === "document") return (facets.mine_documents ?? 0) + (facets.permit_documents ?? 0);
    return 0;
  };

  const renderFilters = () => (
    <div style={{ padding: "8px 16px", borderBottom: "1px solid #f0f0f0" }}>
      <Space size={[4, 4]} wrap>
        {isOnMinePage && (
          <Tag
            onClick={() => toggleScopeToMine(!scopeToMine)}
            style={{
              cursor: "pointer",
              backgroundColor: scopeToMine ? "#5e46a115" : "transparent",
              borderColor: scopeToMine ? "#5e46a1" : "#d9d9d9",
              color: scopeToMine ? "#5e46a1" : "#595959",
              margin: 0,
              fontWeight: scopeToMine ? 600 : 400,
            }}
          >
            <Space size={4}>
              <AimOutlined />
              <span>This Mine</span>
            </Space>
          </Tag>
        )}
        {isOnMinePage && <Divider type="vertical" style={{ margin: "0 4px", height: 20 }} />}
        {Object.entries(TYPE_CONFIG).map(([key, config]) => {
          const isActive = activeFilters.includes(key);
          const count = getFacetCount(key);

          return (
            <Tag
              key={key}
              onClick={() => toggleFilter(key)}
              style={{
                cursor: "pointer",
                backgroundColor: isActive ? `${config.color}15` : "transparent",
                borderColor: isActive ? config.color : "#d9d9d9",
                color: isActive ? config.color : "#595959",
                margin: 0,
              }}
            >
              <Space size={4}>
                {config.icon}
                <span>{config.label}</span>
                {searchTerm && <span style={{ opacity: 0.6 }}>({count})</span>}
              </Space>
            </Tag>
          );
        })}
      </Space>
    </div>
  );

  const handleViewAll = () => {
    saveRecentSearch(searchTerm);
    handleClose();
    history.push(router.SEARCH_RESULTS.dynamicRoute({ q: searchTerm }));
  };

  const getCommandIcon = (action: string) => {
    if (action.startsWith("filter:")) {
      const filterKey = action.split(":")[1];
      return TYPE_CONFIG[filterKey]?.icon || <SearchOutlined />;
    }
    if (action === "scope:mine") return <AimOutlined />;
    if (action === "clear:filters") return <DeleteOutlined />;
    return <SearchOutlined />;
  };

  const isCommandActive = (action: string): boolean => {
    if (action.startsWith("filter:")) {
      return activeFilters.includes(action.split(":")[1]);
    }
    if (action === "scope:mine") return scopeToMine;
    return false;
  };

  const renderCommands = () => {
    const { commandPart, searchPart } = parseCommandInput(commandInput);
    const matchingCommands = getMatchingCommands(commandPart);

    return (
      <div className="global-search__commands">
        <Divider orientation="left" plain style={{ margin: "8px 0", fontSize: 12 }}>
          <Space>
            <SearchOutlined />
            Commands
            {searchPart && (
              <Text type="secondary" style={{ fontWeight: "normal" }}>
                → will search "{searchPart}"
              </Text>
            )}
          </Space>
        </Divider>
        <List
          dataSource={matchingCommands}
          renderItem={([key, command], index) => {
            const isSelected = index === selectedIndex;
            const isActive = isCommandActive(command.action);
            const isDisabled = command.action === "scope:mine" && !isOnMinePage;

            return (
              <List.Item
                key={key}
                className={`global-search__result-item ${isSelected ? "global-search__result-item--selected" : ""}`}
                onClick={() => !isDisabled && executeCommand(command.action, searchPart)}
                onMouseEnter={() => setSelectedIndex(index)}
                style={{ opacity: isDisabled ? 0.5 : 1, cursor: isDisabled ? "not-allowed" : "pointer" }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={getCommandIcon(command.action)}
                      size="small"
                      style={{
                        backgroundColor: isActive ? "#5e46a120" : "#f5f5f5",
                        color: isActive ? "#5e46a1" : "#8c8c8c"
                      }}
                    />
                  }
                  title={
                    <Space>
                      <Text strong={isSelected} code>/{key}</Text>
                      {isActive && <Tag color="purple" style={{ margin: 0, fontSize: 10 }}>ON</Tag>}
                      {isDisabled && <Text type="secondary" style={{ fontSize: 11 }}>(not on mine page)</Text>}
                    </Space>
                  }
                  description={<Text type="secondary" style={{ fontSize: 12 }}>{command.description}</Text>}
                />
                {isSelected && <Text keyboard style={{ fontSize: 11 }}>↵</Text>}
              </List.Item>
            );
          }}
          split={false}
          locale={{ emptyText: <Text type="secondary">No matching commands</Text> }}
        />
        <div style={{ padding: "8px 16px", borderTop: "1px solid #f0f0f0" }}>
          <Text type="secondary" style={{ fontSize: 11 }}>
            <Text keyboard>Space</Text> applies filter, <Text keyboard>Tab</Text> autocompletes, <Text keyboard>Enter</Text> executes with search term
          </Text>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (commandMode) {
      return renderCommands();
    }
    // Show results if we have a search term OR if scoped to mine (wildcard search)
    const hasActiveSearch = searchTerm || scopeToMine;

    if (hasActiveSearch && groupedResults) {
      let globalIndex = 0;
      return (
        <div className="global-search__results">
          {Object.entries(groupedResults).map(([type, results]) => {
            const config = RESULT_TYPE_CONFIG[type] || { label: type };
            return (
              <div key={type}>
                <Divider orientation="left" plain style={{ margin: "8px 0", fontSize: 12 }}>
                  {config.label}s
                </Divider>
                <List
                  dataSource={results}
                  renderItem={(item) => renderResultItem(item, globalIndex++)}
                  split={false}
                />
              </div>
            );
          })}
          <div style={{ padding: "12px 20px", borderTop: "1px solid #f0f0f0" }}>
            <Button type="link" block onClick={handleViewAll} style={{ color: "#5e46a1" }}>
              View all results for "{searchTerm}"
            </Button>
          </div>
        </div>
      );
    }

    if (hasActiveSearch && searchResults?.length === 0) {
      return (
        <div className="global-search__empty">
          <Space direction="vertical" align="center" style={{ width: "100%", padding: 32 }}>
            <SearchOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
            <Title level={5}>No results found</Title>
            <Text type="secondary">
              {scopeToMine && !searchTerm
                ? "No items found for this mine"
                : activeFilters.length > 0
                  ? "Try removing some filters or adjusting your search"
                  : "Try adjusting your search or browse all results"}
            </Text>
            {searchTerm && (
              <Button
                type="primary"
                onClick={() => {
                  saveRecentSearch(searchTerm);
                  history.push(router.SEARCH_RESULTS.dynamicRoute({ q: searchTerm }));
                  handleClose();
                }}
              >
                See all results for "{searchTerm}"
              </Button>
            )}
          </Space>
        </div>
      );
    }

    if (!hasActiveSearch && recentSearches.length > 0) {
      return (
        <div className="global-search__recent">
          <Divider orientation="left" plain style={{ margin: "8px 0", fontSize: 12 }}>
            <Space>
              <HistoryOutlined />
              Recent Searches
            </Space>
          </Divider>
          <List
            dataSource={recentSearches}
            renderItem={(term, index) => (
              <List.Item
                className={`global-search__result-item ${index === selectedIndex ? "global-search__result-item--selected" : ""}`}
                onClick={() => handleRecentSearchClick(term)}
                onMouseEnter={() => setSelectedIndex(index)}
                extra={
                  <DeleteOutlined
                    onClick={(e) => removeRecentSearch(term, e)}
                    style={{ color: "#bfbfbf", cursor: "pointer", padding: 4 }}
                  />
                }
              >
                <List.Item.Meta
                  avatar={<ClockCircleOutlined style={{ color: "#bfbfbf" }} />}
                  title={term}
                />
              </List.Item>
            )}
            split={false}
          />
        </div>
      );
    }

    return (
      <Space direction="vertical" style={{ width: "100%", padding: "16px 20px" }}>
        <Text type="secondary">
          <SearchOutlined /> Quick Actions
        </Text>
        <Row gutter={[8, 8]}>
          {[
            { icon: <EnvironmentOutlined />, label: "Browse Mines", color: "#2e7d32", route: router.MINE_HOME_PAGE.dynamicRoute({ page: "1", per_page: "25" }) },
            { icon: <TeamOutlined />, label: "Browse Contacts", color: "#1565c0", route: router.CONTACT_HOME_PAGE.dynamicRoute({ page: "1", per_page: "25" }) },
            { icon: <FileSearchOutlined />, label: "Reports", color: "#7b1fa2", route: router.REPORTING_DASHBOARD.route },
          ].map((action) => (
            <Col span={8} key={action.label}>
              <Button
                type="text"
                block
                onClick={() => { history.push(action.route); handleClose(); }}
                style={{ height: "auto", padding: "12px 8px" }}
              >
                <Space direction="vertical" size={4}>
                  <Avatar
                    icon={action.icon}
                    style={{ backgroundColor: `${action.color}20`, color: action.color }}
                  />
                  <Text style={{ fontSize: 12 }}>{action.label}</Text>
                </Space>
              </Button>
            </Col>
          ))}
        </Row>
      </Space>
    );
  };

  return (
    <>
      <Button
        className="global-search-trigger"
        onClick={handleOpen}
        icon={<SearchOutlined />}
      >
        <span className="search-placeholder">{placeholder}</span>
        <span className="search-shortcut">
          <Text keyboard>⌘</Text>
          <Text keyboard>K</Text>
        </span>
      </Button>

      <Modal
        open={isModalVisible}
        onCancel={handleClose}
        footer={
          <Row justify="space-between" style={{ fontSize: 12, color: "#8c8c8c" }}>
            <Space size="middle">
              <span><Text keyboard>↵</Text> select</span>
              <span><Text keyboard>↑↓</Text> navigate</span>
              <span><Text keyboard>/</Text> commands</span>
              <span><Text keyboard>esc</Text> close</span>
            </Space>
          </Row>
        }
        closable={false}
        maskClosable
        keyboard
        className="global-search-modal"
        width={580}
        style={{ top: 80 }}
        destroyOnClose
      >
        <Input
          ref={inputRef}
          prefix={
            <Space size={4}>
              <SearchOutlined style={{ color: "#5e46a1", fontSize: 18 }} />
              {quickFilter && (
                <Tag
                  color="blue"
                  closable
                  onClose={(e) => { e.preventDefault(); setQuickFilter(null); }}
                  style={{ margin: 0, marginLeft: 4 }}
                >
                  {TYPE_CONFIG[quickFilter]?.icon}
                  <span style={{ marginLeft: 4 }}>{TYPE_CONFIG[quickFilter]?.label || quickFilter}</span>
                </Tag>
              )}
            </Space>
          }
          placeholder={quickFilter ? "Search within filter..." : "Search for mines, contacts, permits... (type / for commands)"}
          value={commandMode ? `/${commandInput}` : searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          bordered={false}
          allowClear
          size="large"
          style={{ borderBottom: "1px solid #f0f0f0", borderRadius: 0 }}
        />
        {renderFilters()}
        {renderResults()}
      </Modal>
    </>
  );
};

export default GlobalSearch;
