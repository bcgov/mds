import React, { Component } from "react";
import { Row, Col } from "antd";
import PropTypes from "prop-types";
import VarianceSearchForm from "@/components/Forms/variances/VarianceSearchForm";
// import CustomPropTypes from "@/customPropTypes";

/**
 * @class VarianceSearch supports searching for a filtered list of variances.
 */
const propTypes = {
  handleSearch: PropTypes.func.isRequired,
  handleNameFieldReset: PropTypes.func.isRequired,
  // partyRelationshipTypesList: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  initialValues: PropTypes.objectOf(PropTypes.string),
};

const defaultProps = {
  initialValues: {},
};

// eslint-disable-next-line react/prefer-stateless-function
export class VarianceSearch extends Component {
  render() {
    return (
      <div>
        <Row>
          <Col md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
            <span className="advanced-search__container">
              <VarianceSearchForm
                handleNameFieldReset={this.props.handleNameFieldReset}
                onSubmit={this.props.handleSearch}
                handleSearch={this.props.handleSearch}
                // toggleAdvancedSearch={this.toggleAdvancedSearch}
                // isAdvanceSearch={this.state.isAdvanceSearch}
                // partyTypeOptions={[
                //   { value: "PER", label: "Person" },
                //   { value: "ORG", label: "Organization" },
                // ]}
                // relationshipTypes={[
                //   { value: "", label: "All Roles" },
                //   { value: "NONE", label: "No Role Assigned" },
                //   ...this.props.partyRelationshipTypesList,
                // ]}
                initialValues={this.props.initialValues}
              />
            </span>
          </Col>
        </Row>
      </div>
    );
  }
}

VarianceSearch.propTypes = propTypes;
VarianceSearch.defaultProps = defaultProps;

export default VarianceSearch;
