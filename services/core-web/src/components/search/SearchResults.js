import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import queryString from "query-string";
import { Row, Col } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { sumBy, map, mapValues, keyBy } from "lodash";
import { getSearchResults, getSearchTerms } from "@mds/common/redux/selectors/searchSelectors";
import { getPartyRelationshipTypeHash } from "@mds/common/redux/selectors/staticContentSelectors";
import { fetchSearchOptions, fetchSearchResults } from "@mds/common/redux/actionCreators/searchActionCreator";
import { getSearchOptions } from "@mds/common/redux/reducers/searchReducer";
import { MineResultsTable } from "@/components/search/MineResultsTable";
import { PermitResultsTable } from "@/components/search/PermitResultsTable";
import { ContactResultsTable } from "@/components/search/ContactResultsTable";
import { DocumentResultsTable } from "@/components/search/DocumentResultsTable";
import Loading from "@/components/common/Loading";
import * as router from "@/constants/routes";

const propTypes = {
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  fetchSearchOptions: PropTypes.func.isRequired,
  fetchSearchResults: PropTypes.func.isRequired,
  searchOptions: PropTypes.arrayOf(PropTypes.any).isRequired,
  searchOptionsHash: PropTypes.objectOf(PropTypes.any).isRequired,
  searchResults: PropTypes.objectOf(PropTypes.any),
  searchTerms: PropTypes.arrayOf(PropTypes.string),
  partyRelationshipTypeHash: PropTypes.objectOf(PropTypes.strings).isRequired,
};

const defaultProps = {
  searchResults: [],
  searchTerms: [],
};

const TableForGroup = (
  group,
  highlightRegex,
  partyRelationshipTypeHash,
  query,
  showAdvancedLookup
) =>
  ({
    mine: (
      <MineResultsTable
        header="Mines"
        highlightRegex={highlightRegex}
        searchResults={group.results}
        query={query.q}
        showAdvancedLookup={showAdvancedLookup}
      />
    ),
    party: (
      <ContactResultsTable
        header="Contacts"
        highlightRegex={highlightRegex}
        searchResults={group.results}
        partyRelationshipTypeHash={partyRelationshipTypeHash}
        query={query.q}
        showAdvancedLookup={showAdvancedLookup}
      />
    ),
    permit: (
      <PermitResultsTable
        header="Permits"
        highlightRegex={highlightRegex}
        searchResults={group.results}
      />
    ),
    mine_documents: (
      <DocumentResultsTable
        header="Mine Documents"
        highlightRegex={highlightRegex}
        searchResults={group.results}
      />
    ),
    permit_documents: (
      <DocumentResultsTable
        header="Permit Documents"
        highlightRegex={highlightRegex}
        searchResults={group.results}
      />
    ),
  }[group.type]);

const NoResults = (searchTerms) => {
  const searchTooShort = !searchTerms.find((term) => term.length > 2);
  return (
    <Row type="flex" justify="center">
      <Col sm={22} md={18} lg={8} className="padding-xxl--top">
        <h2>No Results Found.</h2>
        {searchTooShort && (
          <p>At least one word in your search needs to be a minimum of three characters.</p>
        )}
        <p>Please try another search.</p>
      </Col>
    </Row>
  );
};

const CantFindIt = () => (
  <Row type="flex" justify="center">
    <Col sm={22} md={18} lg={8} className="padding-lg--top padding-xxl--bottom">
      <h2>Can&#39;t find it?</h2>
      <p>
        Try clicking to see more results, or select the advanced lookup if available. Also, double
        check your spelling to ensure it is correct. If you feel there is a problem, contact the
        Core administrator to ask for assistance.
      </p>
    </Col>
  </Row>
);

export class SearchResults extends Component {
  state = {
    isSearching: false,
    hasSearchTerm: false,
    params: {},
  };

  componentDidMount = () => {
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

  // eslint-disable-next-line react/require-render-return
  render = () => {
    const groupedSearchResults = [];
    Object.entries(this.props.searchResults).forEach((entry) => {
      const resultGroup = {
        type: entry[0],
        score: sumBy(entry[1], "score"),
        results: map(entry[1], "result"),
      };
      if (resultGroup.score > 0) groupedSearchResults.push(resultGroup);
    });

    groupedSearchResults.sort((a, b) => a.score - b.score);
    groupedSearchResults.reverse();

    const type_filter = this.state.params.t;

    if (this.state.isSearching) return <Loading />;

    const results = this.props.searchTerms.map((t) => `"${t}"`).join(", ");

    return this.state.hasSearchTerm ? (
      <div className="landing-page">
        <div>
          <div className="landing-page__header">
            <h1 className="padding-sm--bottom">
              {`${
                type_filter ? this.props.searchOptionsHash[type_filter] : "Search results"
              } for ${results}`}
            </h1>
            <div>
              {type_filter ? (
                <Link to={router.SEARCH_RESULTS.dynamicRoute({ q: this.state.params.q })}>
                  <ArrowLeftOutlined className="padding-sm--right" />
                  {`Back to all search results for ${results}`}
                </Link>
              ) : (
                <p>
                  <span className="padding-lg--right">Just show me:</span>
                  {this.props.searchOptions.map((o) => (
                    <span className="padding-lg" key={o.model_id}>
                      <Link
                        to={router.SEARCH_RESULTS.dynamicRoute({
                          q: this.state.params.q,
                          t: o.model_id,
                        })}
                      >
                        {o.description}
                      </Link>
                    </span>
                  ))}
                </p>
              )}
            </div>
          </div>
          <div className="landing-page__content">
            <div className="tab__content">
              {groupedSearchResults.length === 0 && NoResults(this.props.searchTerms)}
              {groupedSearchResults.map((group) => (
                <div className="padding-lg--top padding-xxl--bottom" key={group.type}>
                  {TableForGroup(
                    group,
                    RegExp(`${this.props.searchTerms.join("|")}`, "i"),
                    this.props.partyRelationshipTypeHash,
                    this.state.params,
                    type_filter
                  )}
                  {!type_filter && (
                    <Link
                      className="float-right"
                      to={router.SEARCH_RESULTS.dynamicRoute({
                        q: this.state.params.q,
                        t: group.type,
                      })}
                    >
                      See more search results for {this.props.searchOptionsHash[group.type]}
                    </Link>
                  )}
                </div>
              ))}
              <CantFindIt />
            </div>
          </div>
        </div>
      </div>
    ) : (
      <></>
    );
  };
}

const mapStateToProps = (state) => ({
  searchOptions: getSearchOptions(state),
  searchOptionsHash: mapValues(keyBy(getSearchOptions(state), "model_id"), "description"),
  searchResults: getSearchResults(state),
  searchTerms: getSearchTerms(state),
  partyRelationshipTypeHash: getPartyRelationshipTypeHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchSearchOptions,
      fetchSearchResults,
    },
    dispatch
  );

SearchResults.propTypes = propTypes;
SearchResults.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(SearchResults);
