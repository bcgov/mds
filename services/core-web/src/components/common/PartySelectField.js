import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { throttle } from "lodash";
import PropTypes from "prop-types";
import { Icon, Divider, AutoComplete } from "antd";
import { Field } from "redux-form";
import { getSearchResults } from "@common/selectors/searchSelectors";
import { getLastCreatedParty } from "@common/selectors/partiesSelectors";
import { fetchSearchResults } from "@common/actionCreators/searchActionCreator";
import { setAddPartyFormState } from "@common/actionCreators/partiesActionCreator";
import { createItemMap, createItemIdsArray } from "@common/utils/helpers";
import { Validate } from "@common/utils/Validate";
import RenderLargeSelect from "./RenderLargeSelect";
import LinkButton from "@/components/common/LinkButton";
import CustomPropTypes from "@/customPropTypes";

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
  searchResults: PropTypes.objectOf(PropTypes.any),
  fetchSearchResults: PropTypes.func.isRequired,
  setAddPartyFormState: PropTypes.func.isRequired,
  lastCreatedParty: CustomPropTypes.party.isRequired,
  initialValue: PropTypes.objectOf(PropTypes.string),
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
  searchResults: [],
  initialValue: "",
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

const transformData = (data, options, footer) => {
  const transformedData = data.map((opt) => (
    <AutoComplete.Option key={opt} value={opt}>
      {`${options[opt].name}, ${
        Validate.checkEmail(options[opt].email) ? options[opt].email : "Email Unknown"
      }`}
    </AutoComplete.Option>
  ));

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
    this.fetchSearchResultsThrottled = throttle(this.props.fetchSearchResults, 2000, {
      leading: true,
      trailing: true,
    });
  }

  componentDidMount() {
    if (this.props.initialValue) {
      this.handleSearch(this.props.initialValue.label);
      this.setState({
        selectedOption: this.props.initialValue,
      });
    }
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
    const lastCreatedPartyUpdated = this.props.lastCreatedParty !== nextProps.lastCreatedParty;
    const searchResultsUpdated = this.props.searchResults !== nextProps.searchResults;

    // If new search results have been returned, transform the results and store them in component state.
    if (searchResultsUpdated || lastCreatedPartyUpdated) {
      let filteredParties = nextProps.searchResults.party.map((sr) => sr.result);

      if (this.props.organization && !this.props.person) {
        filteredParties = filteredParties.filter(
          ({ party_type_code }) => party_type_code === "ORG"
        );
      } else if (this.props.person && !this.props.organization) {
        filteredParties = filteredParties.filter(
          ({ party_type_code }) => party_type_code === "PER"
        );
      }

      // If a new party was just added, add that party to the list of search results.
      if (lastCreatedPartyUpdated) {
        filteredParties.push(nextProps.lastCreatedParty);
      }

      this.setState(() => {
        const newPartyDataSource = transformData(
          createItemIdsArray(filteredParties, "party_guid"),
          createItemMap(filteredParties, "party_guid"),
          this.props.allowAddingParties &&
            renderAddPartyFooter(this.showAddPartyForm, this.props.partyLabel)
        );
        return { partyDataSource: newPartyDataSource };
      });
    }

    // If a new party was just added, detect this and set the selected party to the newly created party.
    if (lastCreatedPartyUpdated) {
      this.setState({
        selectedOption: {
          key: nextProps.lastCreatedParty.party_guid,
          label: nextProps.lastCreatedParty.name,
        },
      });
    }
  };

  handleSearch = (value) => {
    if (value.length > 2) {
      this.fetchSearchResultsThrottled(value, "party");
    }
    this.setState({ selectedOption: { key: value, label: value } });
  };

  handleSelect = (value, option) => {
    this.setState({ selectedOption: option });
  };

  // Validator to ensure the selected option is in the collection of available options.
  // This validator is appened to any validators passed in from the form in the render function below.
  // eslint-disable-next-line consistent-return
  validOption = (value) => {
    // ignore this validation if an initialValue is passed in
    if (this.props.initialValue && this.props.initialValue !== this.state.selectedOption) {
      return this.state.partyDataSource.find((opt) => opt.key === value)
        ? undefined
        : `Invalid ${this.props.partyLabel}`;
    }
  };

  render = () => {
    return (
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
  };
}

const mapStateToProps = (state) => ({
  lastCreatedParty: getLastCreatedParty(state),
  searchResults: getSearchResults(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchSearchResults,
      setAddPartyFormState,
    },
    dispatch
  );

PartySelectField.propTypes = propTypes;
PartySelectField.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(PartySelectField);
