import React, { useState, FC, useRef } from "react";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter, useHistory, RouteComponentProps } from "react-router-dom";

import { Input, InputProps, Button } from "antd";

import {
  fetchSearchBarResults,
  clearSearchBarResults,
} from "@common/actionCreators/searchActionCreator";
import * as router from "@/constants/routes";
import { getSearchBarResults } from "@common/reducers/searchReducer";

import { SearchOutlined } from "@ant-design/icons";
import { useKey } from "@/App";
import { ISearchResult } from "@mds/common";
import { SearchBarDropdown } from "@/components/search/SearchBarDropdown";
import { throttle } from "lodash";
import { ActionCreator } from "@/interfaces/actionCreator";

// any attribute that can be passed to antd Input can be passed in here without being explicitly named
interface SearchBarProps extends InputProps {
  iconPlacement: "prefix" | "suffix" | false;
  placeholderText: string;
  showFocusButton: boolean;
  searchBarResults: ISearchResult[];
  fetchSearchBarResults: ActionCreator<typeof fetchSearchBarResults>;
}

const SearchBar: FC<RouteComponentProps & SearchBarProps> = ({
  iconPlacement = "suffix",
  placeholderText = "Search...",
  showFocusButton = false,
  ...props
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermHistory, setSearchTermHistory] = useState([]);
  const [isFocussed, setIsFocussed] = useState(false);

  const history = useHistory();
  const hotKeyRef = useRef();

  const fetchSearchBarResultsThrottled = throttle(props.fetchSearchBarResults, 2000, {
    leading: true,
    trailing: true,
  });

  if (showFocusButton) {
    useKey((event) => event.ctrlKey && event.key === "k", hotKeyRef);
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
        searchBarResults={props.searchBarResults}
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

const mapStateToProps = (state) => ({
  searchBarResults: getSearchBarResults(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchSearchBarResults,
      clearSearchBarResults,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(SearchBar));
