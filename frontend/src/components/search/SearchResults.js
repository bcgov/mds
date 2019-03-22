import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import * as Strings from "@/constants/strings";
import { Tabs, Icon, Table, Button, Row, Col } from "antd";
import { getSearchResults, getSearchTerms } from "@/selectors/searchSelectors";
import { uniq, uniqBy, map, toArray } from "lodash";

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
  searchTerms: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  searchResults: [],
  searchTerms: [],
};

const renderSearchResultGroup = (group) => (
  <Col md={12}>
    <h2>{group.type}</h2>
    {group.results.map((result) => (
      <p>{`${result.mine_name || ""}${result.name || ""}${result.permit_no || ""}`}</p>
    ))}
    <br />
  </Col>
);

export class SearchResults extends Component {
  componentDidMount() {}

  render() {
    // const resultTypes = uniq(this.props.searchResults.map(({ type }) => type));

    const groupedSearchResults = _(this.props.searchResults)
      .groupBy("type")
      .map((items, key) => ({
        type: key,
        score: _.sumBy(items, "score"),
        results: _.map(items, "result"),
      }))
      .orderBy("score", "desc")
      .value();

    return (
      <div className="landing-page">
        <div className="landing-page__header">
          <h1>Search results for {this.props.searchTerms.map((x) => `"${x}"`).join(", ")}</h1>
        </div>
        <div className="landing-page__content">
          <div className="tab__content">
            {groupedSearchResults.length === 0 && [
              <br />,
              <h2>No Results Found</h2>,
              <p>Please try another search.</p>,
            ]}
            {groupedSearchResults.map((group) => renderSearchResultGroup(group))}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  searchResults: getSearchResults(state),
  searchTerms: getSearchTerms(state),
});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

SearchResults.propTypes = propTypes;
SearchResults.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchResults);
