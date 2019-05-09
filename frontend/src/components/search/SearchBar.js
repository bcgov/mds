import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Input, Dropdown, Card } from "antd";
import { getSearchBarResults } from "@/selectors/searchSelectors";
import { fetchSearchBarResults, clearSearchBarResults } from "@/actionCreators/searchActionCreator";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { SearchBarDropdown } from "@/components/search/SearchBarDropdown";
import { debounce } from "lodash";

const { Search } = Input;

const propTypes = {
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  fetchSearchBarResults: PropTypes.func.isRequired,
  clearSearchBarResults: PropTypes.func.isRequired,
  searchResults: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
  searchResults: [],
};

const defaultPlaceholderText = "Search";
const selectedPlaceholderText = "Search for mines, contacts, or more";

export class SearchBar extends Component {
  state = {
    isSelected: false,
    searchTerm: "",
    searchTermHistory: [],
  };

  constructor(props) {
    super(props);
    this.fetchSearchResultsDebounced = debounce(this.props.fetchSearchBarResults, 1000);
  }

  changeSearchTerm = (e) => {
    const newSearchTerm = e.target.value;
    this.setState({ searchTerm: newSearchTerm });

    if (newSearchTerm.length > 3) {
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
    this.props.history.push(`/search?q=${searchTerm}`);
  };

  clearSearch = () => {
    this.props.clearSearchBarResults();
    this.setState({
      isSelected: true,
      searchTerm: "",
    });
    // clear store? clear local copy of results?
  };

  render = () => (
    <div
      id="searchBox"
      style={{
        width: "30vw",
        minWidth: "350px",
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
              searchResults={this.props.searchResults}
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
          onClick={this.clearSearch}
          onFocus={this.clearSearch}
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

const mapStateToProps = (state) => ({
  searchResults: getSearchBarResults(state),
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(SearchBar));
