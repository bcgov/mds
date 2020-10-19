import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { throttle } from "lodash";
import PropTypes from "prop-types";
import { Divider } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Field } from "redux-form";
import { getSearchResults } from "@common/selectors/searchSelectors";
import { getLastCreatedParty } from "@common/selectors/partiesSelectors";
import { fetchSearchResults } from "@common/actionCreators/searchActionCreator";
import { setAddPartyFormState } from "@common/actionCreators/partiesActionCreator";
import { createItemMap, createItemIdsArray } from "@common/utils/helpers";
import { Validate } from "@common/utils/Validate";
import LinkButton from "@/components/common/LinkButton";
import CustomPropTypes from "@/customPropTypes";
import RenderLargeSelect from "./RenderLargeSelect";

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
  initialValues: PropTypes.objectOf(PropTypes.any),
  initialSearch: PropTypes.string,
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
  initialValues: undefined,
  initialSearch: undefined,
};

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

const transformData = (data, options, footer) => {
  const transformedData = data.map((opt) => ({
    value: options[opt].party_guid,
    label: `${options[opt].name}, ${
      Validate.checkEmail(options[opt].email) ? options[opt].email : "Email Unknown"
    }`,
  }));

  // Display footer only if desired (Add new party behavior is enabled.)
  return footer ? transformedData.concat({ value: "footer", label: footer }) : transformedData;
};

export class PartySelectField extends Component {
  state = {
    selectedOption: { value: "", label: "" },
    partyDataSource: [],
    showingAddPartyForm: false,
    initialSearch: this.props.initialSearch,
  };

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
    this.setState({
      showingAddPartyForm: true,
    });
    this.props.setAddPartyFormState({
      showingAddPartyForm: true,
      person: !this.props.person,
      organization: !this.props.organization,
      partyLabel: this.props.partyLabel,
      initialValues: this.props.initialValues,
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
      if (this.state.showingAddPartyForm && lastCreatedPartyUpdated) {
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
    if (this.state.showingAddPartyForm && lastCreatedPartyUpdated) {
      this.setState({
        selectedOption: {
          value: nextProps.lastCreatedParty.party_guid,
          label: nextProps.lastCreatedParty.name,
        },
        showingAddPartyForm: false,
      });
    }
  };

  handleFocus = () => {
    if (this.state.initialSearch) {
      this.fetchSearchResultsThrottled(this.state.initialSearch, "party");
    }
    this.setState({ initialSearch: null });
  };

  handleSearch = (value) => {
    if (value.length > 2) {
      this.fetchSearchResultsThrottled(value, "party");
    }
    this.setState({ selectedOption: { value, label: value } });
  };

  handleSelect = (value, option) => {
    this.setState({ selectedOption: option });
  };

  // Validator to ensure the selected option is in the collection of available options.
  // This validator is appened to any validators passed in from the form in the render function below.
  // eslint-disable-next-line consistent-return
  validOption = (value) => {
    // ignore this validation if an initialValue is passed in
    if (
      this.props.initialValue &&
      this.props.initialValue.value !== this.state.selectedOption.value
    ) {
      return this.state.partyDataSource.find((opt) => opt.value === value)
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
        handleFocus={this.handleFocus}
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
