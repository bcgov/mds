import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Input, Dropdown, Card } from "antd";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { throttle } from "lodash";
import { getSearchBarResults } from "@common/selectors/searchSelectors";
import {
  fetchSearchBarResults,
  clearSearchBarResults,
} from "@common/actionCreators/searchActionCreator";
import * as router from "@/constants/routes";
import { SearchBarDropdown } from "@/components/search/SearchBarDropdown";

const propTypes = {
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  fetchSearchBarResults: PropTypes.func.isRequired,
  clearSearchBarResults: PropTypes.func.isRequired,
  searchBarResults: PropTypes.arrayOf(PropTypes.object).isRequired,
  containerId: PropTypes.string,
};

const defaultProps = {
  containerId: "",
};

const defaultPlaceholderText = "Search";
const selectedPlaceholderText = "";

export class SearchBar extends Component {
  state = {
    isSelected: false,
    searchTerm: "",
    searchTermHistory: [],
  };

  constructor(props) {
    super(props);
    this.fetchSearchResultsThrottled = throttle(this.props.fetchSearchBarResults, 2000, {
      leading: true,
      trailing: true,
    });
  }

  changeSearchTerm = (e) => {
    const newSearchTerm = e.target.value;
    this.setState({ searchTerm: newSearchTerm });

    if (newSearchTerm.length >= 2) {
      this.fetchSearchResultsThrottled(newSearchTerm);
    }
  };

  search = (searchTerm) => {
    if (searchTerm) {
      this.setState((prevState) => {
        const newSearchTermHistory = prevState.searchTermHistory.slice(
          Math.max(prevState.searchTermHistory.length - 2, 0)
        );
        newSearchTermHistory.push(searchTerm);
        return {
          isSelected: false,
          searchTermHistory: newSearchTermHistory,
        };
      });
      this.clearSearchBar(false);
      this.props.history.push(router.SEARCH_RESULTS.dynamicRoute({ q: searchTerm }));
    }
  };

  clearSearchBar = (isSelected = true) => {
    this.props.clearSearchBarResults();
    this.setState({
      isSelected,
      searchTerm: "",
    });
  };

  render() {
    return (
      <div id={this.props.containerId}>
        <Dropdown
          overlay={
            <Card className="search-bar">
              <SearchBarDropdown
                history={this.props.history}
                searchTerm={this.state.searchTerm}
                searchTermHistory={this.state.searchTermHistory}
                searchBarResults={this.props.searchBarResults}
              />
            </Card>
          }
          getPopupContainer={
            this.props.containerId ? () => document.getElementById(this.props.containerId) : ""
          }
          trigger={["focus"]}
          visible={this.state.isSelected}
        >
          <Input.Search
            value={this.state.searchTerm}
            placeholder={this.state.isSelected ? selectedPlaceholderText : defaultPlaceholderText}
            onSearch={(searchTerm) => this.search(searchTerm)}
            onChange={this.changeSearchTerm}
            onFocus={() =>
              this.setState({
                isSelected: true,
              })
            }
            onBlur={() =>
              this.setState({
                isSelected: false,
              })
            }
          />
        </Dropdown>
      </div>
    );
  }
}

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

SearchBar.propTypes = propTypes;
SearchBar.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(SearchBar));
