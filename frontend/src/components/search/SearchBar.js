import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Input, Dropdown, Card, Col } from "antd";
import { getSearchBarResults } from "@/selectors/searchSelectors";
import { fetchSearchBarResults, clearSearchBarResults } from "@/actionCreators/searchActionCreator";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { SearchBarDropdown } from "@/components/search/SearchBarDropdown";
import { throttle, debounce } from "lodash";

const { Search } = Input;

const propTypes = {
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  fetchSearchBarResults: PropTypes.func.isRequired,
  clearSearchBarResults: PropTypes.func.isRequired,
  searchBarResults: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const defaultPlaceholderText = "Search";
const selectedPlaceholderText = "Type to search for mines, contacts, or more";

export class SearchBar extends Component {
  state = {
    isSelected: false,
    searchTerm: "",
    searchTermHistory: [],
  };

  constructor(props) {
    super(props);
    this.fetchSearchResultsThrottled = throttle(this.props.fetchSearchBarResults, 1000);
    this.fetchSearchResultsDebounced = debounce(this.props.fetchSearchBarResults, 2000);
  }

  changeSearchTerm = (e) => {
    const newSearchTerm = e.target.value;
    this.setState({ searchTerm: newSearchTerm });

    if (newSearchTerm.length > 3) {
      this.fetchSearchResultsThrottled(newSearchTerm);
      this.fetchSearchResultsDebounced(newSearchTerm);
    }
  };

  search = (searchTerm) => {
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
    this.props.history.push(`/search?q=${searchTerm}`);
  };

  clearSearchBar = (isSelected = true) => {
    this.props.clearSearchBarResults();
    this.setState({
      isSelected,
      searchTerm: "",
    });
  };

  render = () => (
    <Col
      id="searchBox"
      md={4}
      lg={6}
      xl={8}
      style={{
        marginLeft: "auto",
        marginTop: "auto",
        marginBottom: "auto",
        paddingRight: "20px",
      }}
    >
      <Dropdown
        overlay={
          <Card>
            <SearchBarDropdown
              history={this.props.history}
              searchTerm={this.state.searchTerm}
              searchTermHistory={this.state.searchTermHistory}
              searchBarResults={this.props.searchBarResults}
            />
          </Card>
        }
        getPopupContainer={() => document.getElementById("searchBox")}
        trigger={[""]}
        visible={this.state.isSelected}
      >
        <Search
          size="large"
          value={this.state.searchTerm}
          placeholder={this.state.isSelected ? selectedPlaceholderText : defaultPlaceholderText}
          onSearch={(searchTerm) => this.search(searchTerm)}
          onChange={this.changeSearchTerm}
          onClick={this.clearSearchBar}
          onFocus={this.clearSearchBar}
          onBlur={() =>
            this.setState({
              isSelected: false,
            })
          }
        />
      </Dropdown>
    </Col>
  );
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(SearchBar));
