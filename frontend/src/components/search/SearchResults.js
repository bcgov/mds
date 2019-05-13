import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import queryString from "query-string";
import { Row, Col } from "antd";
import { getSearchResults, getSearchTerms } from "@/selectors/searchSelectors";
import { MineResultsTable } from "@/components/search/MineResultsTable";
import { PermitResultsTable } from "@/components/search/PermitResultsTable";
import { ContactResultsTable } from "@/components/search/ContactResultsTable";
import { DocumentResultsTable } from "@/components/search/DocumentResultsTable";
import { getPartyRelationshipTypeHash } from "@/selectors/partiesSelectors";
import { fetchPartyRelationshipTypes } from "@/actionCreators/partiesActionCreator";
import { fetchSearchOptions, fetchSearchResults } from "@/actionCreators/searchActionCreator";
import Loading from "@/components/common/Loading";
import LinkButton from "@/components/common/LinkButton";
import _ from "lodash";
import { getSearchOptions } from "../../reducers/searchReducer";

const propTypes = {
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  fetchSearchOptions: PropTypes.func.isRequired,
  fetchSearchResults: PropTypes.func.isRequired,
  searchOptions: PropTypes.arrayOf(PropTypes.any).isRequired,
  searchResults: PropTypes.objectOf(PropTypes.any),
  searchTerms: PropTypes.arrayOf(PropTypes.string),
  partyRelationshipTypeHash: PropTypes.objectOf(PropTypes.strings).isRequired,
  fetchPartyRelationshipTypes: PropTypes.func.isRequired,
};

const defaultProps = {
  searchResults: [],
  searchTerms: [],
};

const renderSearchResultGroup = (group, searchTerms, partyRelationshipTypeHash, queryParams) => {
  const highlightRegex = RegExp(`${searchTerms.join("|")}`, "i");
  const query = queryString.parse(queryParams);
  if (group.type === "mine") {
    return (
      <Col sm={24} lg={12} style={{ padding: "30px", paddingBottom: "60px" }}>
        <MineResultsTable
          header="Mines"
          highlightRegex={highlightRegex}
          searchResults={group.results}
          query={query.q}
        />
      </Col>
    );
  }
  if (group.type === "permit") {
    return (
      <Col sm={24} lg={12} style={{ padding: "30px", paddingBottom: "60px" }}>
        <PermitResultsTable
          header="Permits"
          highlightRegex={highlightRegex}
          searchResults={group.results}
        />
      </Col>
    );
  }
  if (group.type === "party") {
    return (
      <Col sm={24} lg={12} style={{ padding: "30px", paddingBottom: "60px" }}>
        <ContactResultsTable
          header="Contacts"
          highlightRegex={highlightRegex}
          searchResults={group.results}
          partyRelationshipTypeHash={partyRelationshipTypeHash}
          query={query.q}
        />
      </Col>
    );
  }
  if (group.type === "permit_documents" || group.type === "mine_documents") {
    return (
      <Col sm={24} lg={12} style={{ padding: "30px", paddingBottom: "60px" }}>
        <DocumentResultsTable
          header={group.type === "permit_documents" ? "Permit Documents" : "Mine Documents"}
          highlightRegex={highlightRegex}
          searchResults={group.results}
        />
      </Col>
    );
  }
  return <div />;
};

export class SearchResults extends Component {
  state = {
    isSearching: false,
    hasSearchTerm: false,
    params: {},
  };

  componentDidMount = () => {
    if (!this.props.partyRelationshipTypeHash.PMT) {
      this.props.fetchPartyRelationshipTypes();
    }
    if (!this.props.searchOptions.length) {
      this.props.fetchSearchOptions();
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
    const parsedParams = queryString.parse(location.search);
    const { q, t } = parsedParams;

    if (q) {
      this.props.fetchSearchResults(q, t);
      this.setState({ params: parsedParams, isSearching: true, hasSearchTerm: true });
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
                <h1 style={{ paddingBottom: "5px" }}>
                  Search results for {this.props.searchTerms.map((t) => `"${t}"`).join(", ")}
                </h1>
                <div>
                  Just show me:
                  {this.props.searchOptions.map((o) => (
                    <span style={{ padding: "20px" }}>
                      <LinkButton
                        key={o.model_id}
                        onClick={() => {
                          this.props.history.push(
                            `/search?q=${this.state.params.q}&t=${o.model_id}`
                          );
                        }}
                      >
                        {o.description}
                      </LinkButton>
                    </span>
                  ))}
                </div>
              </div>
              <div className="landing-page__content">
                <div className="tab__content">
                  {groupedSearchResults.length === 0 && [
                    <br />,
                    <h2>No Results Found</h2>,
                    <p>Please try another search.</p>,
                  ]}
                  <Row gutter={10}>
                    {groupedSearchResults.map((group) =>
                      renderSearchResultGroup(
                        group,
                        this.props.searchTerms,
                        this.props.partyRelationshipTypeHash,
                        this.props.location.search
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
  searchOptions: getSearchOptions(state),
  searchResults: getSearchResults(state),
  searchTerms: getSearchTerms(state),
  partyRelationshipTypeHash: getPartyRelationshipTypeHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPartyRelationshipTypes,
      fetchSearchOptions,
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
