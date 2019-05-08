import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Row } from "antd";
import { getSearchResults, getSearchTerms } from "@/selectors/searchSelectors";
import { MineResultsTable } from "@/components/search/MineResultsTable";
import { PermitResultsTable } from "@/components/search/PermitResultsTable";
import { ContactResultsTable } from "@/components/search/ContactResultsTable";
import { DocumentResultsTable } from "@/components/search/DocumentResultsTable";
import { getPartyRelationshipTypeHash } from "@/selectors/partiesSelectors";
import { fetchPartyRelationshipTypes } from "@/actionCreators/partiesActionCreator";
import _ from "lodash";

const propTypes = {
  searchResults: PropTypes.arrayOf(PropTypes.object),
  searchTerms: PropTypes.arrayOf(PropTypes.string),
  partyRelationshipTypeHash: PropTypes.objectOf(PropTypes.strings).isRequired,
  fetchPartyRelationshipTypes: PropTypes.func.isRequired,
};

const defaultProps = {
  searchResults: [],
  searchTerms: [],
};

const renderSearchResultGroup = (group, searchTerms, partyRelationshipTypeHash) => {
  const highlightRegex = RegExp(`${searchTerms.join("|")}`, "i");
  if (group.type === "Mines") {
    return (
      <MineResultsTable
        header={group.type}
        highlightRegex={highlightRegex}
        searchResults={group.results}
      />
    );
  }
  if (group.type === "Permits") {
    return (
      <PermitResultsTable
        header={group.type}
        highlightRegex={highlightRegex}
        searchResults={group.results}
      />
    );
  }
  if (group.type === "Contacts") {
    return (
      <ContactResultsTable
        header={group.type}
        highlightRegex={highlightRegex}
        searchResults={group.results}
        partyRelationshipTypeHash={partyRelationshipTypeHash}
      />
    );
  }
  if (group.type === "Permit Documents") {
    return (
      <DocumentResultsTable
        header={group.type}
        highlightRegex={highlightRegex}
        searchResults={group.results}
      />
    );
  }
  return <div />;
};

export class SearchResults extends Component {
  componentDidMount() {
    if (!this.props.partyRelationshipTypeHash.PMT) {
      this.props.fetchPartyRelationshipTypes();
    }
  }

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
            <Row gutter={48}>
              {groupedSearchResults.map((group) =>
                renderSearchResultGroup(
                  group,
                  this.props.searchTerms,
                  this.props.partyRelationshipTypeHash
                )
              )}
            </Row>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  searchResults: getSearchResults(state),
  searchTerms: getSearchTerms(state),
  partyRelationshipTypeHash: getPartyRelationshipTypeHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPartyRelationshipTypes,
    },
    dispatch
  );

SearchResults.propTypes = propTypes;
SearchResults.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchResults);
