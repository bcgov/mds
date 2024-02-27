import React, { useEffect, useMemo, useState } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import queryString from "query-string";
import { Row, Col } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { sumBy, map, mapValues, keyBy } from "lodash";
import { getSearchResults, getSearchTerms } from "@mds/common/redux/selectors/searchSelectors";
import { getPartyRelationshipTypeHash } from "@mds/common/redux/selectors/staticContentSelectors";
import {
  fetchSearchOptions,
  fetchSearchResults,
} from "@mds/common/redux/actionCreators/searchActionCreator";
import { getSearchOptions } from "@mds/common/redux/reducers/searchReducer";
import { MineResultsTable } from "@/components/search/MineResultsTable";
import { PermitResultsTable } from "@/components/search/PermitResultsTable";
import { ContactResultsTable } from "@/components/search/ContactResultsTable";
import { DocumentResultsTable } from "@/components/search/DocumentResultsTable";
import Loading from "@/components/common/Loading";
import * as router from "@/constants/routes";
import PermitSearchResults from "@mds/common/components/permits/PermitSearchResults";

interface SearchResultsProps {
  location: { search: string };
  history: { push: (path: string) => void };
  fetchSearchOptions: () => Promise<void>;
  fetchSearchResults: (query, tab) => Promise<void>;
  searchOptions: any[];
  searchOptionsHash: { [key: string]: any };
  searchResults: { [key: string]: any };
  searchTerms: string[];
  partyRelationshipTypeHash: { [key: string]: string };
}

const TableForGroup = (
  group: any,
  highlightRegex: RegExp,
  partyRelationshipTypeHash: { [key: string]: string },
  query: { q?: string },
  showAdvancedLookup: boolean
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
    mines_act_permits: (
      <PermitSearchResults
        header="Permit Documents"
        highlightRegex={highlightRegex}
        searchResults={group.results}
      />
    ),
  }[group.type]);

const NoResults = (searchTerms: string[]) => {
  const searchTooShort = !searchTerms.find((term) => term.length > 2);
  return (
    <Row justify="center">
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
  <Row justify="center">
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

export const SearchResults: React.FC<SearchResultsProps> = (props) => {
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearchTerm, setHasSearchTerm] = useState(false);
  const [params, setParams] = useState<{ [key: string]: string }>({});

  const handleSearch = (location: { search: string }) => {
    const parsedParams = queryString.parse(location.search);
    const { q, t } = parsedParams;

    if (q) {
      props.fetchSearchResults(q, t);
      setParams(parsedParams);
      setIsSearching(true);
      setHasSearchTerm(true);
    }
  };

  useEffect(() => {
    if (!props.searchOptions.length) {
      props.fetchSearchOptions();
    }
    handleSearch(props.location);
  }, []);

  useEffect(() => {
    handleSearch(props.location);
  }, [props.location]);

  const groupedSearchResults: any[] = useMemo(() => {
    const results: any[] = [];
    Object.entries(props.searchResults).forEach((entry) => {
      const resultGroup = {
        type: entry[0],
        score: sumBy(entry[1], "score"),
        results: map(entry[1], "result"),
      };
      if (resultGroup.score > 0) results.push(resultGroup);
    });

    results.sort((a, b) => a.score - b.score);
    results.reverse();

    setIsSearching(false);

    return results;
  }, [props.searchResults]);

  const results = useMemo(() => props.searchTerms.map((t) => `"${t}"`).join(", "), [
    props.searchTerms,
  ]);

  const type_filter = params.t;

  if (isSearching) return <Loading />;

  return hasSearchTerm ? (
    <div className="landing-page">
      <div>
        <div className="landing-page__header">
          <h1 className="padding-sm--bottom">
            {`${
              type_filter ? props.searchOptionsHash[type_filter] : "Search results"
            } for ${results}`}
          </h1>
          <div>
            {type_filter ? (
              <Link to={router.SEARCH_RESULTS.dynamicRoute({ q: params.q })}>
                <ArrowLeftOutlined className="padding-sm--right" />
                {`Back to all search results for ${results}`}
              </Link>
            ) : (
              <p>
                <span className="padding-lg--right">Just show me:</span>
                {props.searchOptions.map((o) => (
                  <span className="padding-lg" key={o.model_id}>
                    <Link
                      to={router.SEARCH_RESULTS.dynamicRoute({
                        q: params.q,
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
            {groupedSearchResults.length === 0 && NoResults(props.searchTerms)}
            {groupedSearchResults.map((group) => (
              <div className="padding-lg--top padding-xxl--bottom" key={group.type}>
                {TableForGroup(
                  group,
                  RegExp(`${props.searchTerms.join("|")}`, "i"),
                  props.partyRelationshipTypeHash,
                  params,
                  !!type_filter
                )}
                {!type_filter && (
                  <Link
                    className="float-right"
                    to={router.SEARCH_RESULTS.dynamicRoute({
                      q: params.q,
                      t: group.type,
                    })}
                  >
                    See more search results for {props.searchOptionsHash[group.type]}
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

const mapStateToProps = (state: any) => ({
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

export default connect(mapStateToProps, mapDispatchToProps)(SearchResults);
