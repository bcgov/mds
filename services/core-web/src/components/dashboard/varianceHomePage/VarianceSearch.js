import React, { Component } from "react";
import { Row, Col } from "antd";
import { isEmpty, some, negate } from "lodash";
import PropTypes from "prop-types";
import VarianceSearchForm from "@/components/Forms/variances/VarianceSearchForm";
import CustomPropTypes from "@/customPropTypes";

/**
 * @class VarianceSearch supports searching for a filtered list of variances.
 */
const propTypes = {
  handleVarianceSearch: PropTypes.func.isRequired,
  handleReset: PropTypes.func.isRequired,
  initialValues: CustomPropTypes.varianceSearchInitialValues,
  mineRegionOptions: CustomPropTypes.options.isRequired,
  complianceCodes: CustomPropTypes.options.isRequired,
  filterVarianceStatusOptions: CustomPropTypes.filterOptions.isRequired,
};

const defaultProps = {
  initialValues: {},
};

const haveAdvancedSearchFilters = ({
  region,
  compliance_code,
  variance_application_status_code,
  major,
  issue_date_after,
  issue_date_before,
  expiry_date_before,
  expiry_date_after,
}) =>
  major ||
  some(
    [
      region,
      compliance_code,
      variance_application_status_code,
      issue_date_after,
      issue_date_before,
      expiry_date_before,
      expiry_date_after,
    ],
    negate(isEmpty)
  );

export class VarianceSearch extends Component {
  state = {
    receivedFirstInitialValues: false,
    expandAdvancedSearch: false,
  };

  toggleIsAdvancedSearch = () =>
    this.setState((prevState) => ({
      expandAdvancedSearch: !prevState.expandAdvancedSearch,
    }));

  componentWillReceiveProps = (nextProps) => {
    if (
      !this.state.receivedFirstInitialValues &&
      this.props.initialValues !== nextProps.initialValues
    ) {
      this.setState({
        receivedFirstInitialValues: true,
        expandAdvancedSearch: haveAdvancedSearchFilters(nextProps.initialValues),
      });
    }
  };

  render() {
    return (
      <div>
        <Row>
          <Col md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
            <span className="advanced-search__container">
              <VarianceSearchForm
                handleReset={this.props.handleReset}
                onSubmit={this.props.handleVarianceSearch}
                toggleAdvancedSearch={this.toggleIsAdvancedSearch}
                isAdvanceSearch={this.state.expandAdvancedSearch}
                initialValues={this.props.initialValues}
                complianceCodes={this.props.complianceCodes}
                mineRegionOptions={this.props.mineRegionOptions}
                filterVarianceStatusOptions={this.props.filterVarianceStatusOptions}
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
