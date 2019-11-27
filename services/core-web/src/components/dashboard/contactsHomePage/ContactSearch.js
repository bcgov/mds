import React, { Component } from "react";
import { Row, Col } from "antd";
import PropTypes from "prop-types";
import AdvancedContactSearchForm from "@/components/Forms/AdvancedContactSearchForm";
import CustomPropTypes from "@/customPropTypes";

/**
 * @class ContactSearch supports searching for a filtered list of parties.
 */
const propTypes = {
  handleSearch: PropTypes.func.isRequired,
  handleNameFieldReset: PropTypes.func.isRequired,
  partyRelationshipTypesList: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  initialValues: PropTypes.objectOf(PropTypes.string),
};

const defaultProps = {
  initialValues: {},
};

const checkAdvancedSearch = ({ email, phone_no, role }) => email || phone_no || role;

export class ContactSearch extends Component {
  state = {
    isAdvanceSearch: checkAdvancedSearch(this.props.initialValues),
  };

  toggleAdvancedSearch = () => {
    this.setState((prevState) => ({ isAdvanceSearch: !prevState.isAdvanceSearch }));
  };

  render() {
    return (
      <div>
        <Row>
          <Col md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
            <span className="advanced-search__container">
              <AdvancedContactSearchForm
                handleNameFieldReset={this.props.handleNameFieldReset}
                onSubmit={this.props.handleSearch}
                handleSearch={this.props.handleSearch}
                toggleAdvancedSearch={this.toggleAdvancedSearch}
                isAdvanceSearch={this.state.isAdvanceSearch}
                partyTypeOptions={[
                  { value: "PER", label: "Person" },
                  { value: "ORG", label: "Organization" },
                ]}
                relationshipTypes={[
                  { value: "", label: "All Roles" },
                  { value: "NONE", label: "No Role Assigned" },
                  ...this.props.partyRelationshipTypesList,
                ]}
                initialValues={this.props.initialValues}
              />
            </span>
          </Col>
        </Row>
      </div>
    );
  }
}

ContactSearch.propTypes = propTypes;
ContactSearch.defaultProps = defaultProps;

export default ContactSearch;
