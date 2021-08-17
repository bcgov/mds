/* eslint-disable */
import React, { useState } from "react";
import { Select, Spin } from "antd";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import debounce from "lodash/debounce";
import {
  fetchSearchResults,
  clearAllSearchResults,
} from "@common/actionCreators/searchActionCreator";

import { storeSubsetSearchResults } from "@common/actions/searchActions";
import { getSearchResults, getSearchSubsetResults } from "@common/selectors/searchSelectors";
import { getPartyRelationshipTypesList } from "@common/selectors/staticContentSelectors";

function DebounceSelect({ fetchOptions, debounceTimeout = 800, search, ...props }) {
  const [fetching, setFetching] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const fetchRef = React.useRef(0);
  const debounceFetcher = React.useMemo(() => {
    const loadOptions = (value) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);
      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
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
} // Usage of DebounceSelect

const RenderMultiSelectPartySearch = (props) => {
  const fetchUserList = (value) => {
    return props.fetchSearchResults(value, "party").then(
      (response) =>
        response &&
        response.data.search_results.party
          // .filter(({ mine_party_appt }) => {
          //   mine_party_appt &&
          //     mine_party_appt.length > 0 &&
          //     mine_party_appt.map(({ mine_party_appt_type_code }) => mine_party_appt_type_code !== PMT
          //     );
          // })
          .map((party) => ({
            label: party.result.name,
            value: party.result.party_guid,
          }))
    );
  };

  return (
    <DebounceSelect
      mode="multiple"
      value={props.searchSubsetResults}
      placeholder="Select users"
      fetchOptions={fetchUserList}
      search={props.fetchSearchResults}
      onChange={(newValue) => {
        props.storeSubsetSearchResults(newValue);
      }}
      style={{
        width: "100%",
      }}
    />
  );
};

const mapStateToProps = (state) => ({
  partyRelationshipTypesList: getPartyRelationshipTypesList(state),
  searchResults: getSearchResults(state),
  searchSubsetResults: getSearchSubsetResults(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchSearchResults,
      clearAllSearchResults,
      storeSubsetSearchResults,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(RenderMultiSelectPartySearch);
