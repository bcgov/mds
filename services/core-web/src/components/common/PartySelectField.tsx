import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHashtag } from "@fortawesome/pro-light-svg-icons";

import { Divider } from "antd";
import { MailOutlined, PhoneOutlined, PlusOutlined } from "@ant-design/icons";
import { change, Field } from "@mds/common/components/forms/form";
import { getSearchResults } from "@mds/common/redux/selectors/searchSelectors";
import { getLastCreatedParty } from "@mds/common/redux/slices/partiesSlice";
import { fetchSearchResults } from "@mds/common/redux/actionCreators/searchActionCreator";
import { setAddPartyFormState } from "@mds/common/redux/slices/partiesSlice";
import { createItemMap } from "@common/utils/helpers";
import { Validate } from "@mds/common/redux/utils/Validate";
import LinkButton from "@mds/common/components/common/LinkButton";
import RenderLargeSelect from "@mds/common/components/forms/RenderLargeSelect";
import { IParty, ItemMap } from "@mds/common/interfaces";
import { FormContext } from "@mds/common/components/forms/FormWrapper";

interface IPartySelectOption {
  value: string | undefined,
  originalValue?: IParty,
  label: JSX.Element
};

const renderAddPartyFooter = (showAddParty, partyLabel) => (
  // put the click handler on the div so that they can click anywhere on the item to create
  <button className="wrapped-text left" onClick={showAddParty}>
    <Divider style={{ margin: "0" }} />
    <p className="footer-text">{`Can't find the ${partyLabel} you are looking for?`}</p>
    <LinkButton onClick={showAddParty}>
      <PlusOutlined className="padding-small--right" />
      {`Add a new ${partyLabel}`}
    </LinkButton>
  </button>
);

const transformData = (options: ItemMap<IParty>, header: JSX.Element) => {
  const transformedData: IPartySelectOption[] = (Object.entries(options))
    .map(([key, party]) => ({
      value: key,
      originalValue: party,
      label: (
        <div>
          <span>{party.name}</span>
          <div className="inline-flex">
            <div className="padding-right">
              <FontAwesomeIcon icon={faHashtag} />
            </div>
            <span>{party.party_orgbook_entity?.registration_id}</span>
          </div>
          <div className="inline-flex">
            <div className="padding-right">
              <MailOutlined className="icon-xs" />
            </div>
            <span>
              {Validate.checkEmail(party.email) ? party.email : "Email Unknown"}
            </span>
          </div>
          <div className="inline-flex">
            <div className="padding-right">
              <PhoneOutlined className="icon-xs" />
            </div>
            <span>
              {party.phone_no} {party.phone_ext ? `x${party.phone_ext}` : ""}
            </span>
          </div>
        </div>
      ),
    }))
    .filter((opt) => opt.value);

  // Display header only if desired (Add new party behavior is enabled.)
  if (header) {
    transformedData.unshift({ value: undefined, label: header });
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
  initialValues?: any;
  allowNull?: boolean;
  disabled?: boolean;
  onSelect?: (val: IParty) => void;
  required?: boolean;
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
  const { formName } = useContext(FormContext);

  const searchResults = useSelector(getSearchResults);
  const lastCreatedParty = useSelector(getLastCreatedParty);
  const [selectedOption, setSelectedOption] = useState(initialValues ?? { value: "", label: "" });
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
    if (searchResults?.party) {
      let filteredParties = searchResults.party.map((sr) => sr.result);

      if (organization && !person) {
        filteredParties = filteredParties.filter(
          ({ party_type_code }) => party_type_code === "ORG"
        );
      } else if (person && !organization) {
        filteredParties = filteredParties.filter(
          ({ party_type_code }) => party_type_code === "PER"
        );
      }

      if (lastCreatedParty?.party_guid) {
        filteredParties.unshift(lastCreatedParty);
      }

      const newPartyDataSource = transformData(
        createItemMap(filteredParties, "party_guid"),
        allowAddingParties && renderAddPartyFooter(showAddPartyForm, partyLabel)
      );

      if (newPartyDataSource) {
        setPartyDataSource(newPartyDataSource);
      }
    }

    if (lastCreatedParty?.party_guid) {
      const value = lastCreatedParty.party_guid;
      const option = {
        value: lastCreatedParty.party_guid,
        label: lastCreatedParty.name,
        originalValue: lastCreatedParty,
      };
      dispatch(change(formName, rest.name, lastCreatedParty.party_guid));
      handleSelect(value, option);
    }

  }, [lastCreatedParty, searchResults, organization, person, allowAddingParties, partyLabel]);

  const handleSearch = (value) => {
    if (value.length >= 2) {
      setSearching(true);
      debouncedSearch(value, "party");
    }
  };

  const handleSelect = (_value: string, option: IPartySelectOption) => {
    setSelectedOption(option);
    if (onSelect) {
      onSelect(option.originalValue)
    }
  };

  return (
    <Field
      loading={searching}
      disabled={disabled}
      {...rest}
      component={RenderLargeSelect}
      handleSearch={handleSearch}
      handleSelect={handleSelect}
      validate={validate}
      dataSource={partyDataSource}
      selectedOption={selectedOption}
    />
  );
};

export default PartySelectField;
