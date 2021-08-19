/* eslint-disable */
import React, { useState, useRef, useMemo } from "react";
import { Select, Spin } from "antd";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import debounce from "lodash/debounce";
import {
  fetchSearchResults,
  clearAllSearchResults,
} from "@common/actionCreators/searchActionCreator";

function DebounceSelect({ fetchOptions, debounceTimeout = 800, search, ...props }) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState([]);
  const fetchRef = useRef(0);
  const debounceFetcher = useMemo(() => {
    const loadOptions = (value) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);
      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          return;
        }
        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  return (
    <Select
      labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...props}
      options={options}
    />
  );
}

const propTypes = {
  onSelectedPartySearchResultsChanged: PropTypes.func.isRequired,
  onSearchResultsChanged: PropTypes.func,
  onSearchSubsetResultsChanged: PropTypes.func,
};

const defaultProps = {
  onSearchResultsChanged: () => {},
  onSearchSubsetResultsChanged: () => {},
};

// TODO: Implement ability to "clear search results".
const RenderMultiSelectPartySearch = (props) => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchSubsetResults, setSearchSubsetResults] = useState([]);
  const [selectedPartySearchResults, setSelectedPartySearchResults] = useState([]);

  const getFetchOptions = (value) =>
    props.fetchSearchResults(value, "party").then((response) => {
      const results = response?.data?.search_results || [];
      props.onSearchResultsChanged(results);
      setSearchResults(results);
      return results?.party?.map((party) => ({
        label: party.result.name,
        value: party.result.party_guid,
      }));
    });

  // TODO: I don't think this is needed (see below).
  // const handleSearch = (value) => {
  //   return props.fetchSearchResults(value, "party").then((response) => {
  //     const results = response?.data?.search_results;
  //     props.onSearchResultsChanged(results);
  //     setSearchResults(results);
  //   });
  // };

  const handleChange = (value) => {
    props.onSearchSubsetResultsChanged(value);
    setSearchSubsetResults(value);

    const selectedPartyGuids = value.map((option) => option.value);

    let newSelectedPartySearchResults =
      selectedPartySearchResults?.filter((p) => selectedPartyGuids.includes(p.party_guid)) || [];

    const currentPartyGuids = selectedPartySearchResults?.map((result) => result.party_guid) || [];

    const newParties = [];
    selectedPartyGuids?.forEach((partyGuid) => {
      if (!currentPartyGuids.includes(partyGuid)) {
        const party = searchResults?.party?.find((p) => p?.result?.party_guid == partyGuid)?.result;
        if (!party) {
          throw new Error(`Party with GUID ${partyGuid} should be present in the search results!`);
        }
        newParties.push(party);
      }
    });
    newSelectedPartySearchResults = [...newSelectedPartySearchResults, ...newParties];
    props.onSelectedPartySearchResultsChanged(newSelectedPartySearchResults);
    setSelectedPartySearchResults(newSelectedPartySearchResults);
  };

  return (
    <DebounceSelect
      mode="multiple"
      value={searchSubsetResults}
      placeholder="Search for contacts"
      fetchOptions={getFetchOptions}
      // TODO: I don't think this is being used...
      // search={(value) => handleSearch(value)}
      onChange={(value) => handleChange(value)}
      style={{
        width: "100%",
      }}
    />
  );
};

RenderMultiSelectPartySearch.propTypes = propTypes;
RenderMultiSelectPartySearch.defaultProps = defaultProps;

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchSearchResults,
      clearAllSearchResults,
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(RenderMultiSelectPartySearch);
