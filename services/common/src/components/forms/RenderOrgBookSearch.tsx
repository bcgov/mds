import React, { FC, useContext, useEffect, useRef, useState } from "react";
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
import { IOrgbookCredential, IOrgBookSearchResult } from "@mds/common/interfaces";
import { BaseInputProps, getFormItemLabel } from "./BaseInput";
import { FormContext } from "./FormWrapper";

interface OrgBookSearchProps extends BaseInputProps {
  data?: any;
  setCredential: (credential: IOrgbookCredential) => void;
}

const RenderOrgBookSearch: FC<OrgBookSearchProps> = ({
  data,
  help,
  label = "",
  labelSubtitle,
  id = "",
  input,
  meta,
  required,
  disabled = false,
  setCredential,
}) => {
  const dispatch = useDispatch();
  const { isEditMode } = useContext(FormContext);
  const searchOrgBookResults: IOrgBookSearchResult[] = useSelector(getSearchOrgBookResults);
  const orgBookCredential = useSelector(getOrgBookCredential);

  const lastFetchId = useRef(0);

  const [options, setOptions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDirty, setIsDirty] = useState(meta?.touched);

  const handleChange = (changeValue) => {
    setIsSearching(false);
    if (meta) {
      setIsDirty(true);
      input?.onChange(changeValue);
    }
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
    if (searchOrgBookResults) {
      const selectOptions = searchOrgBookResults.map((result) => ({
        text: result.text,
        value: result.registration_id,
      }));
      setOptions(selectOptions);
    }
  }, [searchOrgBookResults]);

  useEffect(() => {
    if (data) {
      setOptions(data);
    }
  }, [data]);

  const handleSelect = async (value) => {
    const registrationId = value.key;
    const credential = searchOrgBookResults.find((result) => result.registration_id === registrationId);
    const credentialId = credential?.credential_id;

    await dispatch(fetchOrgBookCredential(credentialId));
  };

  useEffect(() => {
    if (orgBookCredential) {
      setCredential(orgBookCredential);
    }
  }, [orgBookCredential]);

  const debouncedSearch: DebouncedFunc<typeof handleSearch> = debounce(handleSearch, 1000);
  const handleSearchDebounced = useRef(debouncedSearch).current;

  return (
    <Form.Item
      name={input?.name}
      label={getFormItemLabel(label, required, labelSubtitle)}
      validateStatus={
        (meta && isDirty) || meta.touched
          ? (meta.error && "error") || (meta.warning && "warning")
          : ""
      }
      help={
        ((meta && isDirty) || meta.touched) &&
        ((meta.error && <span>{meta.error}</span>) || (meta.warning && <span>{meta.warning}</span>))
      }
      id={id}
      required={required}
      getValueProps={() => input?.value !== "" && { value: input?.value }}
    >
      <>
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
          disabled={disabled || !isEditMode}
          value={options.length === 1 ? { key: options[0].text } : undefined}
        >
          {options.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.text}
            </Select.Option>
          ))}
        </Select>
        {help && <div className={`form-item-help ${input?.name}-form-help`}>{help}</div>}
      </>
    </Form.Item>
  );
};

export default RenderOrgBookSearch;
