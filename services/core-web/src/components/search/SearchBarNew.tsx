import React, { useState, FC } from "react";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter, useHistory, RouteComponentProps } from "react-router-dom";

import { Input, Dropdown, Card, Typography } from "antd";
import { SizeType } from "antd/lib/config-provider/SizeContext";

import {
  fetchSearchBarResults,
  clearSearchBarResults,
} from "@common/actionCreators/searchActionCreator";
import * as router from "@/constants/routes";
import { getSearchBarResults } from "@common/reducers/searchReducer";

interface SearchBarProps {
  minimalView: boolean;
}

const SearchBarNew: FC<RouteComponentProps & SearchBarProps> = ({ minimalView = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const history = useHistory();
  console.log(history);

  const changeSearchTerm = (event) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
  };

  const clearSearchBar = () => {
    setSearchTerm("");
  };

  const search = (newSearchTerm: string) => {
    if (newSearchTerm) {
      const newHistory = [newSearchTerm, ...searchHistory];
      setSearchHistory(newHistory);
    }
    clearSearchBar();
    history.push(router.SEARCH_RESULTS.dynamicRoute({ q: newSearchTerm }));
  };

  const minimalProps = minimalView ? {} : { size: "default" as SizeType };
  return (
    <div>
      <Input.Search
        value={searchTerm}
        placeholder="Search by Mines, Contacts, Permits or Documents Name..."
        onSearch={(searchTerm) => search(searchTerm)}
        onChange={changeSearchTerm}
        {...minimalProps}
      />
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(SearchBarNew));
