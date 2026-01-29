import React, { useState, FC, useRef } from "react";

import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Input, InputProps, Button } from "antd";

import {
  fetchSearchBarResults,
  clearSearchBarResults,
  selectSearchBarResults,
} from "@mds/common/redux/slices/searchSlice";
import * as router from "@/constants/routes";

import { SearchOutlined } from "@ant-design/icons";
import { useKey } from "@/App";
import { ISearchResult, ISimpleSearchResult } from "@mds/common/interfaces/search/searchResult.interface";
import { SearchBarDropdown } from "@/components/search/SearchBarDropdown";
import { throttle } from "lodash";

interface SearchBarProps extends InputProps {
  iconPlacement: "prefix" | "suffix" | false;
  placeholderText: string;
  showFocusButton: boolean;
}

const SearchBar: FC<SearchBarProps> = ({
  iconPlacement = "suffix",
  placeholderText = "Search...",
  showFocusButton = false,
  ...props
}) => {
  const dispatch = useDispatch();
  const searchBarResults = useSelector(selectSearchBarResults);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermHistory, setSearchTermHistory] = useState([]);
  const [isFocussed, setIsFocussed] = useState(false);

  const history = useHistory();
  const hotKeyRef = useRef();

  const fetchSearchBarResultsThrottled = throttle((term: string) => {
    dispatch(fetchSearchBarResults({ searchTerm: term }));
  }, 2000, {
    leading: true,
    trailing: true,
  });

  if (showFocusButton) {
    useKey((event) => {
      const platform: string = window.navigator.platform.toLowerCase();
      const isMac = platform.includes("mac");

      const actionKeyPressed = isMac ? event.metaKey : event.ctrlKey;

      return actionKeyPressed && event.key === "k";
    }, hotKeyRef);
  }

  const changeSearchTerm = (event) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);

    if (newSearchTerm.length >= 2) {
      fetchSearchBarResultsThrottled(newSearchTerm);
    }
  };

  const clearSearchBar = () => {
    setSearchTerm("");
  };

  const search = () => {
    if (searchTerm) {
      const newHistory = [searchTerm, ...searchTermHistory];
      setSearchTermHistory(newHistory);
    }
    clearSearchBar();
    history.push(router.SEARCH_RESULTS.dynamicRoute({ q: searchTerm }));
  };

  const getFocusButton = () => {
    if (!showFocusButton) {
      return null;
    }
    const platform: string = window.navigator.platform.toLowerCase();
    const isMac = platform.includes("mac");
    let buttonText = isMac ? "⌘ + K" : "CTRL + K";
    if (isFocussed) {
      buttonText = "↵";
    }
    const button = (
      <Button onClick={search} className="search-bar-button">
        {buttonText}
      </Button>
    );
    return { suffix: button };
  };

  const iconProps = iconPlacement ? { [iconPlacement]: <SearchOutlined /> } : {};

  return (
    <div>
      <SearchBarDropdown
        history={history}
        searchTerm={searchTerm}
        searchTermHistory={searchTermHistory}
        searchBarResults={searchBarResults}
      >
        <Input
          value={searchTerm}
          placeholder={isFocussed ? "" : placeholderText}
          onPressEnter={search}
          onChange={changeSearchTerm}
          className={isFocussed ? "searchbar search-focussed" : "searchbar search-not-focussed"}
          onFocus={() => {
            setIsFocussed(true);
          }}
          onBlur={() => {
            setIsFocussed(false);
          }}
          ref={hotKeyRef}
          {...(showFocusButton ? getFocusButton() : null)}
          {...props}
          {...iconProps}
        />
      </SearchBarDropdown>
    </div>
  );
};

export default SearchBar;
