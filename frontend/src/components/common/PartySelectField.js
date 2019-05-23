import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { debounce } from "lodash";
import { compareTwoStrings } from "string-similarity";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import LinkButton from "@/components/common/LinkButton";

import { Icon, Divider, AutoComplete } from "antd";
import { Field } from "redux-form";
import RenderLargeSelect from "./RenderLargeSelect";

import { fetchParties, setAddPartyFormState } from "@/actionCreators/partiesActionCreator";
import { getRawParties, getLastCreatedParty } from "@/selectors/partiesSelectors";
import { createItemMap, createItemIdsArray } from "@/utils/helpers";
import { Validate } from "@/utils/Validate";

const propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  partyLabel: PropTypes.string,
  // Defaults to false, set to true to only see people. Displays both people and organizations by default.
  person: PropTypes.bool,
  // Defaults to false, set to true to only see organizations. Displays both people and organizations by default.
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
    <p className="footer-text">{`Can't find the ${partyLabel} you are looking for?`}</p>
    <LinkButton onClick={showAddParty}>
      <Icon type="plus" style={{ paddingRight: "5px" }} />
      {`Add a new ${partyLabel}`}
    </LinkButton>
  </div>
);

const transformData = (data, options, footer, searchTerm) => {
  // Party data is converted to AutoComplete Options, then sorted by similarity to the search text based on.
  // This handles multi-word names, middle names, and alternatives orders (depending on what the back end
  // returns). For example, a search for John Smith could show the results in the order below, without
  // completely filtering any out:
  // John Smith
  // Smith John
  // John James Smith
  // John Williams
  const transformedData = data
    .map((opt) => (
      <AutoComplete.Option key={opt} value={opt}>
        {`${options[opt].name}, ${
          Validate.checkEmail(options[opt].email) ? options[opt].email : "Email Unknown"
        }`}
      </AutoComplete.Option>
    ))
    .sort(
      (a, b) =>
        compareTwoStrings(searchTerm, b.props.children) -
        compareTwoStrings(searchTerm, a.props.children)
    );
  // Display footer only if desired (Add new party behavior is enabled.)
  return footer
    ? transformedData.concat(
        <AutoComplete.Option disabled key="footer" value="footer">
          {footer}
        </AutoComplete.Option>
      )
    : transformedData;
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
    // If new search results have been returned, transform the results and store them in component state.
    if (this.props.parties !== nextProps.parties) {
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

      // If a new party was just added, detect this and set the selected party to the newly created party.
      if (this.props.lastCreatedParty !== nextProps.lastCreatedParty) {
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

  // Validator to ensure the selected option is in the collection of available options.
  // This validator is appened to any validators passed in from the form in the render function below.
  validOption = (value) =>
    this.state.partyDataSource.find((opt) => opt.key === value)
      ? undefined
      : `"Invalid ${this.props.partyLabel}`;

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
