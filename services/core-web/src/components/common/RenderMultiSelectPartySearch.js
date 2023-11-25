import React, { useState, useRef, useMemo, useEffect } from "react";
import { Select, Spin } from "antd";
import { bindActionCreators } from "redux";
import { LoadingOutlined } from "@ant-design/icons";
import { isEmpty } from "lodash";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import debounce from "lodash/debounce";
import {
  fetchSearchResults,
  clearAllSearchResults,
} from "@mds/common/redux/actionCreators/searchActionCreator";

const debouncePropTypes = {
  fetchOptions: PropTypes.func.isRequired,
  debounceTimeout: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export function DebounceSelect(props) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState([]);
  const fetchRef = useRef(0);
  const debounceFetcher = useMemo(() => {
    const loadOptions = (value) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);
      props.fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          return;
        }
        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, props.debounceTimeout);
  }, [props.fetchOptions, props.debounceTimeout]);

  return (
    <Select
      labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={
        fetching ? <Spin size="small" indicator={<LoadingOutlined />} /> : "No contacts found"
      }
      {...props}
      options={options}
    />
  );
}

DebounceSelect.propTypes = debouncePropTypes;

const propTypes = {
  onSelectedPartySearchResultsChanged: PropTypes.func.isRequired,
  onSearchResultsChanged: PropTypes.func,
  onSearchSubsetResultsChanged: PropTypes.func,
  partyType: PropTypes.string.isRequired,
  fetchSearchResults: PropTypes.func.isRequired,
  triggerSelectReset: PropTypes.bool.isRequired,
};

const defaultProps = {
  onSearchResultsChanged: () => {},
  onSearchSubsetResultsChanged: () => {},
};

export const RenderMultiSelectPartySearch = (props) => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchSubsetResults, setSearchSubsetResults] = useState([]);
  const [selectedPartySearchResults, setSelectedPartySearchResults] = useState([]);

  useEffect(() => {
    if (props.triggerSelectReset) {
      setSearchSubsetResults([]);
    }
  }, [props.triggerSelectReset]);

  const getFetchOptions = (value) =>
    props.fetchSearchResults(value, "party").then((response) => {
      const results = response?.data?.search_results || [];
      props.onSearchResultsChanged(results);
      setSearchResults(results);
      return results?.party
        .filter((party) => party.result.party_type_code === props.partyType)
        .map((party) => {
          const isPermittee =
            party.result.mine_party_appt.filter(
              ({ mine_party_appt_type_code }) => mine_party_appt_type_code === "PMT"
            ).length > 0;
          const isOrgbookEntity = !isEmpty(party.result.party_orgbook_entity);
          const isInspector =
            party.result.business_role_appts.filter(
              ({ party_business_role_code }) => party_business_role_code === "INS"
            ).length > 0;
          const isDisabled = isPermittee || isOrgbookEntity || isInspector;
          return {
            label: party.result.name,
            value: party.result.party_guid,
            disabled: isDisabled,
          };
        });
    });

  const handleChange = (value) => {
    props.onSearchSubsetResultsChanged(value);
    setSearchSubsetResults(value);

    const selectedPartyGuids = value.map((option) => option.value);

    let newSelectedPartySearchResults =
      selectedPartySearchResults?.filter((p) => selectedPartyGuids.includes(p.party_guid)) || [];

    const currentPartyGuids = selectedPartySearchResults?.map((result) => result.party_guid) || [];

    const newParties = [];
    // eslint-disable-next-line no-unused-expressions
    selectedPartyGuids?.forEach((partyGuid) => {
      if (!currentPartyGuids.includes(partyGuid)) {
        const party = searchResults?.party?.find((p) => p?.result?.party_guid === partyGuid)
          ?.result;
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
      debounceTimeout={800}
      value={searchSubsetResults}
      placeholder="Search for contacts"
      fetchOptions={getFetchOptions}
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
