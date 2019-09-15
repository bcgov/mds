import React, { Component } from "react";
import { Row, Col } from "antd";
import { isEmpty, some, negate } from "lodash";
import PropTypes from "prop-types";
import IncidentSearchForm from "@/components/Forms/incidents/IncidentSearchForm";
import CustomPropTypes from "@/customPropTypes";

/**
 * @class IncidentsSearch supports searching for a filtered list of incidents.
 */
const propTypes = {
  handleIncidentSearch: PropTypes.func.isRequired,
  initialValues: CustomPropTypes.varianceSearchInitialValues,
  mineRegionOptions: CustomPropTypes.options.isRequired,
  incidentStatusCodeOptions: CustomPropTypes.options.isRequired,
  incidentDeterminationOptions: CustomPropTypes.options.isRequired,
  doSubparagraphOptions: CustomPropTypes.options.isRequired,
  filterVarianceStatusOptions: CustomPropTypes.filterOptions.isRequired,
};

const defaultProps = {
  initialValues: {},
};

const checkAdvancedSearch = ({
  region,
  compliance_code,
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
      issue_date_after,
      issue_date_before,
      expiry_date_before,
      expiry_date_after,
    ],
    negate(isEmpty)
  );

export class IncidentsSearch extends Component {
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
              <IncidentSearchForm
                onSubmit={this.props.handleIncidentSearch}
                handleIncidentSearch={this.props.handleIncidentSearch}
                toggleAdvancedSearch={this.toggleAdvancedSearch}
                isAdvanceSearch={this.state.isAdvanceSearch}
                initialValues={this.props.initialValues}
                mineRegionOptions={this.props.mineRegionOptions}
                filterVarianceStatusOptions={this.props.filterVarianceStatusOptions}
                incidentStatusCodeOptions={this.props.incidentStatusCodeOptions}
                incidentDeterminationOptions={this.props.incidentDeterminationOptions}
                doSubparagraphOptions={this.props.doSubparagraphOptions}
              />
            </span>
          </Col>
        </Row>
      </div>
    );
  }
}

IncidentsSearch.propTypes = propTypes;
IncidentsSearch.defaultProps = defaultProps;

export default IncidentsSearch;
