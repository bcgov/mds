/* eslint-disable */
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { throttle, isEmpty } from "lodash";
import PropTypes from "prop-types";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { PlusOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";
import { getSearchResults } from "@common/selectors/searchSelectors";
import { getLastCreatedParty } from "@common/selectors/partiesSelectors";
import { fetchSearchResults } from "@common/actionCreators/searchActionCreator";
import { setAddPartyFormState } from "@common/actionCreators/partiesActionCreator";
import { createItemMap, createItemIdsArray } from "@common/utils/helpers";
import { Validate } from "@common/utils/Validate";
import { Select, Divider } from "antd";
import LinkButton from "@/components/common/LinkButton";

import CustomPropTypes from "@/customPropTypes";
import RenderLargeSelect from "./RenderLargeSelect";

/**
 * @constant NOWPartySelectField - Ant Design `AutoComplete` component for redux-form -- being used instead of 'RenderSelect' for large data sets that require a limit.
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  dataSource: PropTypes.arrayOf(PropTypes.any).isRequired,
  selectedOption: PropTypes.shape({
    key: PropTypes.string,
    label: PropTypes.label,
    value: PropTypes.string,
  }).isRequired,
  input: PropTypes.shape({
    value: PropTypes.string,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
  }).isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string,
    warning: PropTypes.string,
  }).isRequired,
};

const defaultProps = {
  label: "",
  placeholder: "",
};

const renderAddPartyHeader = (showAddParty, partyLabel) => (
  <div className="wrapped-text">
    <p className="footer-text">{`Can't find the ${partyLabel} you are looking for below? Try typing a different search. If needed, click the link to create a new contact. `}</p>
    <LinkButton onClick={showAddParty}>
      <PlusOutlined className="padding-sm--right" />
      {`Add a new ${partyLabel}`}
    </LinkButton>
    <Divider style={{ margin: "0" }} />
  </div>
);

const transformData = (data, options, header) => {
  const transformedData = data.map((opt) => ({
    value: options[opt].party_guid,
    label: (
      <div>
        <span>{options[opt].name}</span>
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
  }));

  // Display header only if desired (Add new party behavior is enabled.)
  if (header) {
    transformedData.unshift({ value: "header", label: header });
  }

  return transformedData;
};

class NOWPartySelectField extends Component {
  state = {
    selectedOption: { value: "", label: "" },
    partyDataSource: [],
    showingAddPartyForm: false,
  };

  constructor(props) {
    super(props);
    this.fetchSearchResultsThrottled = throttle(this.props.fetchSearchResults, 2000, {
      leading: true,
      trailing: true,
    });
  }

  componentDidMount() {
    if (!isEmpty(this.props.initialValues)) {
      this.handleSearch(this.props.initialValues.label);
      this.setState({
        selectedOption: this.props.initialValues,
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
    console.log("this.props.initialValues", this.props.initialValues);
    console.log("nextProps.initialValues", nextProps.initialValues);
    // console.log(this.state.userSelected)
    // console.log(!this.state.userSelected)
    console.log("this.state.selectedOption", this.state.selectedOption);
    const initialValuesChangedNotByUser =
      this.props.initialValues &&
      // !this.state.userSelected &&
      this.state.selectedOption.value &&
      this.props.initialValues.value !== nextProps.initialValues.value;

    console.log("initialValuesChangedNotByUser OUTSIDE", initialValuesChangedNotByUser);
    const lastCreatedPartyUpdated = this.props.lastCreatedParty !== nextProps.lastCreatedParty;
    const searchResultsUpdated = this.props.searchResults !== nextProps.searchResults;
    if (initialValuesChangedNotByUser) {
      console.log("initialValuesChangedNotByUser INSIDE", initialValuesChangedNotByUser);
      this.handleSearch(nextProps.initialValues.label);
      this.setState({
        selectedOption: {
          value: nextProps.initialValues.value,
          label: nextProps.initialValues.label,
        },
      });
    }

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
      const newPartyDataSource = transformData(
        createItemIdsArray(filteredParties, "party_guid"),
        createItemMap(filteredParties, "party_guid"),
        this.props.allowAddingParties &&
          renderAddPartyHeader(this.showAddPartyForm, this.props.partyLabel)
      );
      this.setState({ partyDataSource: newPartyDataSource });
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
    console.log(this.props.initialSearch);
    if (this.props.initialSearch) {
      this.fetchSearchResultsThrottled(this.props.initialSearch, "party");
    }
  };

  handleSearch = (value) => {
    console.log("value", value);
    // this.setState({ userSelected: false });
    if (value.length > 2) {
      this.fetchSearchResultsThrottled(value, "party");
    }
    console.log("{ value, label: value }", { value, label: value });
    this.setState({ selectedOption: { value, label: value } });
  };

  handleSelect = (value, option) => {
    console.log("Option:", option);
    this.setState({ selectedOption: option });
  };

  render() {
    return (
      <Form.Item
        label={this.props.label}
        validateStatus={
          this.props.meta.touched
            ? (this.props.meta.error && "error") || (this.props.meta.warning && "warning")
            : ""
        }
        help={
          this.props.meta.touched &&
          ((this.props.meta.error && <span>{this.props.meta.error}</span>) ||
            (this.props.meta.warning && <span>{this.props.meta.warning}</span>))
        }
      >
        <Select
          virtual={false}
          showSearch
          id={this.props.id}
          defaultActiveFirstOption={false}
          notFoundContent="Not Found"
          dropdownMatchSelectWidth
          backfill
          style={{ width: "100%" }}
          options={this.props.dataSource}
          placeholder="Search for Contact"
          filterOption={false}
          onSearch={this.handleSearch}
          onSelect={this.handleSelect}
          onChange={this.props.input.onChange}
          onBlur={this.props.input.onChange(this.state.selectedOption.value)}
          {...this.props.input}
          onFocus={(event) => {
            this.handleFocus();
            props.input.onFocus(event);
          }}
        />
      </Form.Item>
    );
  }
}

NOWPartySelectField.propTypes = propTypes;
NOWPartySelectField.defaultProps = defaultProps;

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

export default connect(mapStateToProps, mapDispatchToProps)(NOWPartySelectField);
