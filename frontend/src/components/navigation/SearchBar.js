import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Input, Dropdown, Menu, Button } from "antd";
import { MINE, TEAM } from "@/constants/assets";
import { Link } from "react-router-dom";
import { includes } from "lodash";
import * as router from "@/constants/routes";
import * as Strings from "@/constants/strings";
import { getSearchBarResults } from "@/selectors/searchSelectors";
import { fetchSearchResults, clearSearchBarResults } from "@/actionCreators/searchActionCreator";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";

const Search = Input.Search;

const propTypes = {
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  fetchSearchResults: PropTypes.func.isRequired,
  clearSearchBarResults: PropTypes.func.isRequired,
  searchBarResults: PropTypes.arrayOf(PropTypes.object),
};
const defaultProps = {
  searchBarResults: [],
};

const defaultPlaceholderText = "Search";
const selectedPlaceholderText = "Search for mines, contacts, or more";

const staticMenuItems = () => [
  <Menu.ItemGroup title="Search for" />,
  <Menu.Item key="0">
    <p>
      <img
        alt="Mine"
        className="padding-small--right vertical-align-sm icon-svg-filter"
        height="25px"
        src={MINE}
      />{" "}
      Mines
    </p>
  </Menu.Item>,
  <Menu.Item key="1">
    <p>
      <img
        alt="team"
        className="padding-small--right vertical-align-sm icon-svg-filter"
        height="25px"
        src={TEAM}
      />{" "}
      Contacts
    </p>
  </Menu.Item>,
  <Menu.Divider />,
  <Menu.ItemGroup title="Recent" />,
];

const selectMenuItem = (item, key, keyPath) => {
  alert(JSON.stringify(item));
};

const searchResultDropdown = (searchTerm, searchBarResults) => (
  <Menu>
    {searchTerm.length > 0
      ? [
          searchBarResults.map((result) => (
            <Menu.Item>
              <p>{`${result.result.mine_name || ""}${result.result.name || ""}${result.result
                .permit_no || ""}`}</p>
            </Menu.Item>
          )),
          <Menu.Divider />,
          <Menu.Item>
            <h6>{`See all results for "${searchTerm}"`}</h6>
          </Menu.Item>,
        ]
      : staticMenuItems()}
  </Menu>
);

export class SearchBar extends Component {
  state = {
    isSelected: false,
    searchTerm: "",
    canSearch: true,
    typingTimeout: 0,
  };

  onChangeSearchTerm = (e) => {
    const newSearchTerm = e.target.value;
    this.setState({ searchTerm: newSearchTerm });
    // Automatically update results every 3 seconds
    if (this.state.searchTerm.length > 3 && this.state.canSearch) {
      this.props.fetchSearchResults(newSearchTerm);
      this.setState({ canSearch: false });
      setTimeout(() => {
        this.setState({
          canSearch: true,
        });
      }, 3000);
    }

    // Also search 3 seconds after typing stops
    if (this.state.typingTimeout) {
      clearTimeout(this.state.typingTimeout);
    }

    this.setState({
      typingTimeout: setTimeout(() => {
        this.props.fetchSearchResults(newSearchTerm);
      }, 3000),
    });
  };

  onSearch = (search_term) => {
    if (this.state.typingTimeout) {
      clearTimeout(this.state.typingTimeout);
    }
    this.props.fetchSearchResults(search_term);
    this.props.history.push("/search");
    this.setState({
      isSelected: false,
    });

    // Prevents menu items from clearing before dropdown fades out
    setTimeout(() => {
      this.setState({
        canSearch: true,
        searchTerm: "",
      });
    }, 500);
  };

  clearSearch = () => {
    this.props.clearSearchBarResults();
    this.setState({
      isSelected: true,
      canSearch: true,
      searchTerm: "",
    });
    // clear store? clear local copy of results?
  };

  render() {
    return (
      <div
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
          overlay={searchResultDropdown(this.state.searchTerm, this.props.searchBarResults)}
          trigger={[""]}
          visible={this.state.isSelected}
        >
          <Search
            value={this.state.searchTerm}
            onChange={this.onChangeSearchTerm}
            onClick={this.clearSearch}
            onFocus={this.clearSearch}
            onBlur={() =>
              this.setState({
                isSelected: false,
              })
            }
            placeholder={this.state.isSelected ? selectedPlaceholderText : defaultPlaceholderText}
            onSearch={(search_term) => this.onSearch(search_term)}
            size="large"
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
      fetchSearchResults,
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
