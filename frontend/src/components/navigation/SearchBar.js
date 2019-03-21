import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Input } from "antd";

const Search = Input.Search;

const propTypes = {};

const defaultProps = {};

const defaultPlaceholderText = "Search";
const selectedPlaceholderText = "Search for mines, contact, or more";

export class SearchBar extends Component {
  state = {
    searchTerm: "",
    isSelected: false,
  };

  render() {
    return (
      <div style={this.state.isSelected ? { width: "400px" } : { width: "200px" }}>
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
          onSearch={(value) => console.log(value)}
          size="large"
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

SearchBar.propTypes = propTypes;
SearchBar.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchBar);
