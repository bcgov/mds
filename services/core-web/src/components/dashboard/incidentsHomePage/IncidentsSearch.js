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
  handleReset: PropTypes.func.isRequired,
  initialValues: CustomPropTypes.incidentSearchInitialValues,
  mineRegionOptions: CustomPropTypes.options.isRequired,
  incidentStatusCodeOptions: CustomPropTypes.options.isRequired,
  incidentDeterminationOptions: CustomPropTypes.options.isRequired,
  doSubparagraphOptions: CustomPropTypes.options.isRequired,
};

const defaultProps = {
  initialValues: {},
};

const haveAdvancedSearchFilters = ({
  region,
  major,
  year,
  incident_status,
  codes,
  determination,
}) => major || some([region, year, incident_status, codes, determination], negate(isEmpty));

export class IncidentsSearch extends Component {
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
              <IncidentSearchForm
                handleReset={this.props.handleReset}
                onSubmit={this.props.handleIncidentSearch}
                toggleAdvancedSearch={this.toggleIsAdvancedSearch}
                isAdvanceSearch={this.state.expandAdvancedSearch}
                initialValues={this.props.initialValues}
                mineRegionOptions={this.props.mineRegionOptions}
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
