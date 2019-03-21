import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import * as Strings from "@/constants/strings";
import { Tabs, Icon, Table, Button } from "antd";
import { getSearchResults } from "@/selectors/searchSelectors";

/**
 * @class Search - search results
 * 
 * 
    return (
      <div>
        
      </div>
    );
 */

const propTypes = {
  searchResults: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
  searchResults: [],
};

export class SearchResults extends Component {
  componentDidMount() {}

  render() {
    return (
      <div className="landing-page">
        <div className="landing-page__header">
          <h1>Search results for</h1>
        </div>
        <div className="landing-page__content">
          <div className="tab__content">
            {this.props.searchResults.map(({ type }) => type)}

            {this.props.searchResults.length > 0 &&
              this.props.searchResults.map((result) => (
                <div>
                  {result.type}
                  {result.score}
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  searchResults: getSearchResults(state),
});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

SearchResults.propTypes = propTypes;
SearchResults.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchResults);
