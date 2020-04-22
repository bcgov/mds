import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row, Icon } from "antd";
import { yearNotInFuture } from "@common/utils/Validate";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  toggleAdvancedSearch: PropTypes.func.isRequired,
  handleReset: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  isAdvanceSearch: PropTypes.bool,
  mineRegionOptions: CustomPropTypes.options.isRequired,
  incidentStatusCodeOptions: CustomPropTypes.options.isRequired,
  doSubparagraphOptions: CustomPropTypes.options.isRequired,
  incidentDeterminationOptions: CustomPropTypes.options.isRequired,
};

const defaultProps = {
  isAdvanceSearch: false,
};

export class IncidentSearchForm extends Component {
  handleReset = () => {
    this.props.reset();
    this.props.handleReset();
  };

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit} onReset={this.handleReset}>
        <Row gutter={6}>
          <Col md={24} xs={24}>
            <Field
              id="search"
              name="search"
              component={renderConfig.FIELD}
              placeholder="Search by mine name or number"
            />
          </Col>
        </Row>
        {this.props.isAdvanceSearch && (
          <div>
            <Row gutter={6}>
              <Col md={12} xs={24}>
                <Field
                  id="incident_status"
                  name="incident_status"
                  placeholder="Select Incident Status"
                  component={renderConfig.MULTI_SELECT}
                  data={this.props.incidentStatusCodeOptions}
                />
              </Col>
              <Col md={12} xs={24}>
                <Field
                  id="year"
                  name="year"
                  placeholder="Select Incident Year"
                  component={renderConfig.YEAR}
                  validate={[yearNotInFuture]}
                />
              </Col>
            </Row>

            <Row gutter={6}>
              <Col md={12} xs={24}>
                <Field
                  id="determination"
                  name="determination"
                  placeholder="Select Inspector's Determination"
                  component={renderConfig.MULTI_SELECT}
                  data={this.props.incidentDeterminationOptions}
                />
              </Col>
              <Col md={12} xs={24}>
                <Field
                  id="codes"
                  name="codes"
                  placeholder="Select Code Section"
                  component={renderConfig.MULTI_SELECT}
                  data={this.props.doSubparagraphOptions}
                />
              </Col>
            </Row>

            <Row gutter={6}>
              <Col md={12} xs={24}>
                <Field
                  id="major"
                  name="major"
                  component={renderConfig.SELECT}
                  data={[
                    { value: "", label: "Major and Regional Mines" },
                    { value: "true", label: "Major Mine" },
                    { value: "false", label: "Regional Mine" },
                  ]}
                />
              </Col>
              <Col md={12} xs={24}>
                <Field
                  id="region"
                  name="region"
                  placeholder="Select Mine Region"
                  component={renderConfig.MULTI_SELECT}
                  data={this.props.mineRegionOptions}
                />
              </Col>
            </Row>
          </div>
        )}
        <div className="left center-mobile">
          <Button className="btn--dropdown" onClick={this.props.toggleAdvancedSearch}>
            {this.props.isAdvanceSearch ? "Collapse Filters" : "Expand Filters"}
            <Icon type={this.props.isAdvanceSearch ? "up" : "down"} />
          </Button>
        </div>

        <div className="right center-mobile">
          <Button className="full-mobile" type="secondary" htmlType="reset">
            Clear Filters
          </Button>
          <Button className="full-mobile" type="primary" htmlType="submit">
            Apply Filters
          </Button>
        </div>
      </Form>
    );
  }
}

IncidentSearchForm.propTypes = propTypes;
IncidentSearchForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.INCIDENT_ADVANCED_SEARCH,
  touchOnBlur: false,
  enableReinitialize: true,
})(IncidentSearchForm);
