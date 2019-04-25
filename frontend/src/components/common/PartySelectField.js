import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { debounce } from "lodash";
import { compareTwoStrings } from "string-similarity";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";

import { Icon, Divider, AutoComplete } from "antd";
import { Field } from "redux-form";
import RenderLargeSelect from "./RenderLargeSelect";

import { fetchParties, setAddPartyFormState } from "@/actionCreators/partiesActionCreator";
import { getRawParties, getLastCreatedParty } from "@/selectors/partiesSelectors";
import { createItemMap, createItemIdsArray } from "@/utils/helpers";

// Set organization to only see organizations or set people to only see people. Displays both people and organizations by default.
const propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  partyLabel: PropTypes.string,
  person: PropTypes.bool,
  organization: PropTypes.bool,
  allowAddingParties: PropTypes.bool,
  validate: PropTypes.arrayOf(PropTypes.func),
  parties: PropTypes.arrayOf(CustomPropTypes.party),
  fetchParties: PropTypes.func.isRequired,
  setAddPartyFormState: PropTypes.func.isRequired,
  lastCreatedParty: CustomPropTypes.party.isRequired,
};

const defaultProps = {
  id: "party_guid",
  name: "party_guid",
  label: "Name*",
  partyLabel: "contact",
  person: false,
  organization: false,
  allowAddingParties: false,
  validate: [],
  parties: [],
};

const renderAddPartyFooter = (showAddParty, partyLabel) => (
  <div className="wrapped-text">
    <Divider style={{ margin: "0" }} />
    <p
      style={{
        fontStyle: "italic",
        fontWeight: "500",
        paddingTop: "5px",
        paddingBottom: "5px",
      }}
    >
      {`Can't find the ${partyLabel} you are looking for?`}
    </p>
    <a
      role="link"
      onClick={showAddParty}
      // Accessibility: Event listener
      onKeyPress={showAddParty}
      // Accessibility: Focusable element
      tabIndex="0"
    >
      <Icon type="plus" style={{ paddingRight: "5px" }} />
      {`Add a new ${partyLabel}`}
    </a>
  </div>
);

const transformData = (data, options, footer, searchTerm) => {
  let transformedData = data
    .map((opt) => (
      <AutoComplete.Option key={opt} value={opt}>
        {options[opt].name}
      </AutoComplete.Option>
    ))
    .sort(
      (a, b) =>
        compareTwoStrings(searchTerm, b.props.children) -
        compareTwoStrings(searchTerm, a.props.children)
    );
  if (footer) {
    transformedData = transformedData.concat(
      footer && [
        <AutoComplete.Option disabled key="footer" value="footer">
          {footer}
        </AutoComplete.Option>,
      ]
    );
  }
  return transformedData;
};

export class PartySelectField extends Component {
  state = { selectedOption: { key: "", label: "" }, partyDataSource: [] };

  constructor(props) {
    super(props);
    this.fetchPartiesDebounced = debounce(this.props.fetchParties, 1000);
  }

  showAddPartyForm = () => {
    this.props.setAddPartyFormState({
      showingAddPartyForm: true,
      person: !this.props.person,
      organization: !this.props.organization,
      partyLabel: this.props.partyLabel,
    });
  };

  componentWillReceiveProps = (nextProps) => {
    const partiesUpdated = this.props.parties !== nextProps.parties;
    const lastCreatedPartyUpdated = this.props.lastCreatedParty !== nextProps.lastCreatedParty;

    if (partiesUpdated) {
      let filteredParties = nextProps.parties;

      if (this.props.organization && !this.props.person) {
        filteredParties = filteredParties.filter(
          ({ party_type_code }) => party_type_code === "ORG"
        );
      } else if (this.props.person && !this.props.organization) {
        filteredParties = filteredParties.filter(
          ({ party_type_code }) => party_type_code === "PER"
        );
      }

      this.setState((prevState) => {
        const newPartyDataSource = transformData(
          createItemIdsArray(filteredParties, "party_guid"),
          createItemMap(filteredParties, "party_guid"),
          this.props.allowAddingParties &&
            renderAddPartyFooter(this.showAddPartyForm, this.props.partyLabel),
          prevState.selectedOption.label
        );
        return { partyDataSource: newPartyDataSource };
      });

      if (lastCreatedPartyUpdated) {
        this.setState({
          selectedOption: {
            key: nextProps.lastCreatedParty.party_guid,
            label: nextProps.lastCreatedParty.name,
          },
        });
      }
    }
  };

  handleSearch = (value) => {
    this.fetchPartiesDebounced({ name_search: value });
    this.setState({ selectedOption: { key: value, label: value } });
  };

  handleSelect = (value, option) => {
    this.setState({ selectedOption: option });
  };

  validOption = (value) =>
    this.state.partyDataSource.find((opt) => opt.key === value) ? undefined : "Invalid Contact";

  render = () => (
    <Field
      {...this.props}
      component={RenderLargeSelect}
      handleSearch={this.handleSearch}
      handleSelect={this.handleSelect}
      validate={this.props.validate.concat(this.validOption)}
      dataSource={this.state.partyDataSource}
      selectedOption={this.state.selectedOption}
    />
  );
}

const mapStateToProps = (state) => ({
  parties: getRawParties(state),
  lastCreatedParty: getLastCreatedParty(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchParties,
      setAddPartyFormState,
    },
    dispatch
  );

PartySelectField.propTypes = propTypes;
PartySelectField.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PartySelectField);
