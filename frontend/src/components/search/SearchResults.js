import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import queryString from "query-string";
import { Row } from "antd";
import { getSearchResults, getSearchTerms } from "@/selectors/searchSelectors";
import { MineResultsTable } from "@/components/search/MineResultsTable";
import { PermitResultsTable } from "@/components/search/PermitResultsTable";
import { ContactResultsTable } from "@/components/search/ContactResultsTable";
import { DocumentResultsTable } from "@/components/search/DocumentResultsTable";
import { getPartyRelationshipTypeHash } from "@/selectors/partiesSelectors";
import { fetchPartyRelationshipTypes } from "@/actionCreators/partiesActionCreator";
import { fetchSearchResults } from "@/actionCreators/searchActionCreator";
import Loading from "@/components/common/Loading";
import _ from "lodash";

const propTypes = {
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  fetchSearchResults: PropTypes.func.isRequired,
  searchResults: PropTypes.objectOf(PropTypes.any),
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
  if (group.type === "mine") {
    return (
      <MineResultsTable
        header="Mines"
        highlightRegex={highlightRegex}
        searchResults={group.results}
      />
    );
  }
  if (group.type === "permit") {
    return (
      <PermitResultsTable
        header="Permits"
        highlightRegex={highlightRegex}
        searchResults={group.results}
      />
    );
  }
  if (group.type === "party") {
    return (
      <ContactResultsTable
        header="Contacts"
        highlightRegex={highlightRegex}
        searchResults={group.results}
        partyRelationshipTypeHash={partyRelationshipTypeHash}
      />
    );
  }
  if (group.type === "permit_documents" || group.type === "mine_documents") {
    return (
      <DocumentResultsTable
        header={group.type === "permit_documents" ? "Permit Documents" : "Mine Documents"}
        highlightRegex={highlightRegex}
        searchResults={group.results}
      />
    );
  }
  return <div />;
};

export class SearchResults extends Component {
  params = queryString.parse(this.props.location.search);

  state = {
    isSearching: false,
    hasSearchTerm: false,
    params: {
      ...this.params,
    },
  };

  componentDidMount = () => {
    if (!this.props.partyRelationshipTypeHash.PMT) {
      this.props.fetchPartyRelationshipTypes();
    }
    this.handleSearch(this.props.location);
  };

  componentWillReceiveProps = (nextProps) => {
    const locationChanged = nextProps.location !== this.props.location;
    if (locationChanged) {
      this.handleSearch(nextProps.location);
    }

    // The intention below is to trigger every time the object is updated, even if the
    // array contents are the same, therefore compare with != vs !==
    // eslint-disable-next-line eqeqeq
    if (nextProps.searchResults != this.props.searchResults) {
      this.setState({ isSearching: false });
    }
  };

  handleSearch = (location) => {
    const params = location.search;
    const parsedParams = queryString.parse(params);
    const { q = this.state.params.q } = parsedParams;

    if (q) {
      this.props.fetchSearchResults(q);
      this.setState({ isSearching: true, hasSearchTerm: true });
    }
  };

  render = () => {
    const groupedSearchResults = [];
    Object.entries(this.props.searchResults).forEach((entry) => {
      const key = entry[0];
      const value = entry[1];
      groupedSearchResults.push({
        type: key,
        score: _.sumBy(value, "score"),
        results: _.map(value, "result"),
      });
    });

    groupedSearchResults.sort((a, b) => a.score - b.score);
    groupedSearchResults.reverse();

    return (
      this.state.hasSearchTerm && (
        <div className="landing-page">
          {this.state.isSearching ? (
            <Loading />
          ) : (
            <div>
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
          )}
        </div>
      )
    );
  };
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
      fetchSearchResults,
    },
    dispatch
  );

SearchResults.propTypes = propTypes;
SearchResults.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchResults);
