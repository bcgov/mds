import React, { FC, useEffect, useRef, useState } from "react";
import { Form, Select, Spin } from "antd";
import { debounce, DebouncedFunc } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import {
  getOrgBookCredential,
  getSearchOrgBookResults,
} from "@mds/common/redux/selectors/orgbookSelectors";
import {
  fetchOrgBookCredential,
  searchOrgBook,
} from "@mds/common/redux/actionCreators/orgbookActionCreator";
import { LoadingOutlined } from "@ant-design/icons";
import { IOrgbookCredential } from "@mds/common/interfaces";

interface OrgBookSearchProps {
  isDisabled?: boolean;
  setCredential: (credential: IOrgbookCredential) => void;
  current_party: string;
}

const OrgBookSearch: FC<OrgBookSearchProps> = ({
  isDisabled = false,
  setCredential,
  current_party,
}) => {
  const dispatch = useDispatch();

  const searchOrgBookResults = useSelector(getSearchOrgBookResults);
  const orgBookCredential = useSelector(getOrgBookCredential);

  const lastFetchId = useRef(0);

  const [options, setOptions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedParty, setSelectedParty] = useState(current_party);

  const handleChange = () => {
    setIsSearching(false);
  };

  const handleSearch = async (search) => {
    if (search.length === 0) {
      return;
    }

    lastFetchId.current += 1;

    const fetchId = lastFetchId;
    setOptions([]);
    setIsSearching(true);
    setCredential(null);

    await dispatch(searchOrgBook(search));

    if (fetchId !== lastFetchId) {
      return;
    }

    setIsSearching(false);
  };

  useEffect(() => {
    if (selectedParty !== current_party) {
      setSelectedParty(undefined);
    }
  }, [current_party]);

  useEffect(() => {
    if (searchOrgBookResults) {
      const selectOptions = searchOrgBookResults
        .filter((result) => result.names && result.names.length > 0)
        .map((result) => ({
          text: result.names[0].text,
          value: result.names[0].credential_id,
        }));
      setOptions(selectOptions);
    }
  }, [searchOrgBookResults]);

  const handleSelect = async (value) => {
    const credentialId = value.key;
    await dispatch(fetchOrgBookCredential(credentialId));
    setSelectedParty(value.label);
  };

  useEffect(() => {
    if (orgBookCredential) {
      setCredential(orgBookCredential);
    }
  }, [orgBookCredential]);

  const debouncedSearch: DebouncedFunc<typeof handleSearch> = debounce(handleSearch, 1000);
  const handleSearchDebounced = useRef(debouncedSearch).current;

  return (
    <Form.Item>
      <Select
        virtual={false}
        showSearch
        showArrow
        labelInValue
        placeholder="Start typing to search OrgBook..."
        notFoundContent={isSearching ? <Spin size="small" indicator={<LoadingOutlined />} /> : null}
        filterOption={false}
        onSearch={handleSearchDebounced}
        onChange={handleChange}
        onSelect={handleSelect}
        style={{ width: "100%" }}
        disabled={isDisabled}
        defaultValue={current_party}
        value={selectedParty}
      >
        {options.map((option) => (
          <Select.Option key={option.value}>{option.text}</Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default OrgBookSearch;
