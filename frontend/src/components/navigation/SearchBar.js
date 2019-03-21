import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Input, Dropdown, Menu } from "antd";
import { MINE, TEAM } from "@/constants/assets";
import { Link } from "react-router-dom";
import * as router from "@/constants/routes";
import * as Strings from "@/constants/strings";
import { getSearchResults } from "@/selectors/searchSelectors";
import { fetchSearchResults } from "@/actionCreators/searchActionCreator";
import CustomPropTypes from "@/customPropTypes";
import PropTypes from "prop-types";

const Search = Input.Search;

const propTypes = {
  fetchSearchResults: PropTypes.func.isRequired,
  searchResults: PropTypes.arrayOf(PropTypes.object),
};
const defaultProps = {
  searchResults: [],
};

const defaultPlaceholderText = "Search";
const selectedPlaceholderText = "Search for mines, contacts, or more";

const staticMenuItems = [
  <Menu.Item key="0">
    <img alt="Mine" className="padding-small--right vertical-align-sm icon-svg-filter" src={MINE} />
    Mines
  </Menu.Item>,
  <Menu.Item key="1">
    <img
      alt="team"
      className="padding-small--right icon-sm vertical-align-sm icon-svg-filter"
      src={TEAM}
    />
    Contacts
  </Menu.Item>,
  <Menu.Divider />,
  <Menu.Item key="3">Recent Search Terms</Menu.Item>,
];

const searchResultDropdown = (searchResults) => (
  <Menu>
    {searchResults.length > 0
      ? searchResults.map((result) => (
          <Menu.Item>
            {result.type}
            {result.score}
          </Menu.Item>
        ))
      : staticMenuItems}
  </Menu>
);

export class SearchBar extends Component {
  state = {
    isSelected: false,
  };

  search(search_term) {
    this.props.fetchSearchResults(search_term);
  }

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
          overlay={searchResultDropdown(this.props.searchResults)}
          trigger={[""]}
          visible={this.state.isSelected}
        >
          <Search
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
            placeholder={this.state.isSelected ? selectedPlaceholderText : defaultPlaceholderText}
            onSearch={(search_term) => this.search(search_term)}
            size="large"
          />
        </Dropdown>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  searchResults: getSearchResults(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchSearchResults,
    },
    dispatch
  );

SearchBar.propTypes = propTypes;
SearchBar.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchBar);
