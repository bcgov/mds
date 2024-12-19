import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHashtag } from "@fortawesome/pro-light-svg-icons";

import { Divider } from "antd";
import { MailOutlined, PhoneOutlined, PlusOutlined } from "@ant-design/icons";
import { Field } from "redux-form";
import { getSearchResults } from "@mds/common/redux/selectors/searchSelectors";
import { getLastCreatedParty } from "@mds/common/redux/selectors/partiesSelectors";
import { fetchSearchResults } from "@mds/common/redux/actionCreators/searchActionCreator";
import { setAddPartyFormState } from "@mds/common/redux/actionCreators/partiesActionCreator";
import { createItemIdsArray, createItemMap } from "@common/utils/helpers";
import { Validate } from "@common/utils/Validate";
import LinkButton from "@mds/common/components/common/LinkButton";
import RenderSelect from "@mds/common/components/forms/RenderSelect";

const renderAddPartyFooter = (showAddParty, partyLabel) => (
  <div className="wrapped-text">
    <Divider style={{ margin: "0" }} />
    <p className="footer-text">{`Can't find the ${partyLabel} you are looking for?`}</p>
    <LinkButton onClick={showAddParty}>
      <PlusOutlined className="padding-small--right" />
      {`Add a new ${partyLabel}`}
    </LinkButton>
  </div>
);

const transformData = (data, options, header) => {
  if (data.length === 0) {
    return [];
  }
  const transformedData = data
    .map((opt) => ({
      value: options[opt].party_guid,
      originalValue: options[opt],
      label: (
        <div>
          <span>{options[opt].name}</span>
          <div className="inline-flex">
            <div className="padding-right">
              <FontAwesomeIcon icon={faHashtag} />
            </div>
            <span>{options[opt].party_orgbook_entity?.registration_id}</span>
          </div>
          <div className="inline-flex">
            <div className="padding-right">
              <MailOutlined className="icon-xs" />
            </div>
            <span>
              {Validate.checkEmail(options[opt].email) ? options[opt].email : "Email Unknown"}
            </span>
          </div>
          <div className="inline-flex">
            <div className="padding-right">
              <PhoneOutlined className="icon-xs" />
            </div>
            <span>
              {options[opt].phone_no} {options[opt].phone_ext ? `x${options[opt].phone_ext}` : ""}
            </span>
          </div>
        </div>
      ),
    }))
    .filter((opt) => opt.value);

  // Display header only if desired (Add new party behavior is enabled.)
  if (header) {
    transformedData.unshift({ value: "header", label: header });
  }

  return transformedData;
};

interface PartySelectFieldProps {
  id?: string;
  name?: string;
  label?: string;
  partyLabel?: string;
  // set to true to only see people
  person?: boolean;
  // set to true to only see organizations
  organization?: boolean;
  allowAddingParties: boolean;
  validate: any[];
  searchResults?: any;
  initialValues?: any;
  allowNull?: boolean;
  disabled?: boolean;
  onSelect?: any;
}

export const PartySelectField: FC<PartySelectFieldProps> = ({
  initialValues,
  onSelect,
  person,
  organization,
  partyLabel = "contact",
  allowAddingParties,
  validate,
  disabled,
  allowNull,
  ...rest
}) => {
  const dispatch = useDispatch();

  const searchResults = useSelector(getSearchResults);
  const lastCreatedParty = useSelector(getLastCreatedParty);

  const [selectedOption, setSelectedOption] = useState({ value: "", label: "" });
  const [partyDataSource, setPartyDataSource] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleFetchSearchResults = useCallback(
    (searchTerm: string, searchType: string) => {
      setSearching(true);
      dispatch(fetchSearchResults(searchTerm, searchType));
    },
    [dispatch]
  );

  const debouncedSearch = useMemo(
    () => debounce(handleFetchSearchResults, 1000),
    [handleFetchSearchResults]
  );

  useEffect(() => {
    if (searchResults) {
      setSearching(false);
    }
  }, [searchResults]);

  useEffect(() => {
    if (initialValues?.label) {
      handleSearch(initialValues.label);
      setSelectedOption({
        value: initialValues.value,
        label: initialValues.label,
      });
    }
  }, [initialValues]);

  const showAddPartyForm = () => {
    dispatch(
      setAddPartyFormState({
        showingAddPartyForm: true,
        person: !person,
        organization: !organization,
        partyLabel: partyLabel,
        initialValues,
      })
    );
  };

  useEffect(() => {
    if (searchResults || lastCreatedParty) {
      let filteredParties = searchResults?.party?.map((sr) => sr.result);

      if (filteredParties) {
        if (organization && !person) {
          filteredParties = filteredParties.filter(
            ({ party_type_code }) => party_type_code === "ORG"
          );
        } else if (person && !organization) {
          filteredParties = filteredParties.filter(
            ({ party_type_code }) => party_type_code === "PER"
          );
        }

        if (lastCreatedParty) {
          filteredParties.unshift(lastCreatedParty);
        }

        const newPartyDataSource = transformData(
          createItemIdsArray(filteredParties, "party_guid"),
          createItemMap(filteredParties, "party_guid"),
          allowAddingParties && renderAddPartyFooter(showAddPartyForm, partyLabel)
        );

        if (newPartyDataSource) {
          setPartyDataSource(newPartyDataSource);
        }
      }
    }

    if (lastCreatedParty) {
      setSelectedOption({
        value: lastCreatedParty.party_guid,
        label: lastCreatedParty.name,
      });
    }
  }, [lastCreatedParty, searchResults, organization, person, allowAddingParties, partyLabel]);

  const handleSearch = (value) => {
    if (value.length >= 2) {
      setSearching(true);
      debouncedSearch(value, "party");
    }
    setSelectedOption({ value, label: value });
  };

  const handleSelect = (value, option) => {
    setSelectedOption(option);
    if (onSelect) {
      onSelect({
        ...option,
        ...value.originalValue,
      });
    }
  };

  // Validator to ensure the selected option is in the collection of available options.
  // This validator is appened to any validators passed in from the form in the render function below.
  // eslint-disable-next-line consistent-return
  const validOption = (value) => {
    // ignore this validation if an initialValue is passed in
    if (initialValues && initialValues !== selectedOption && !allowNull) {
      return partyDataSource.find((opt) => opt.value === value)
        ? undefined
        : `Invalid ${partyLabel}`;
    }
  };

  return (
    <Field
      className="left"
      loading={searching}
      disabled={disabled}
      {...rest}
      component={RenderSelect}
      handleSearch={handleSearch}
      handleSelect={handleSelect}
      validate={validate.concat(validOption)}
      dataSource={partyDataSource}
      selectedOption={selectedOption}
    />
  );
};

export default PartySelectField;
