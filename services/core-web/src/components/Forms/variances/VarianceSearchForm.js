import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row, Icon } from "antd";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  toggleAdvancedSearch: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  isAdvanceSearch: PropTypes.bool,
  handleReset: PropTypes.func.isRequired,
  complianceCodes: CustomPropTypes.options.isRequired,
  mineRegionOptions: CustomPropTypes.options.isRequired,
  filterVarianceStatusOptions: CustomPropTypes.filterOptions.isRequired,
};

const defaultProps = {
  isAdvanceSearch: false,
};

export const validate = (values) => {
  const errors = {};
  if (values.issue_date_after && values.issue_date_before) {
    if (Date.parse(values.issue_date_after) > Date.parse(values.issue_date_before)) {
      errors.issue_date_before = "Must be after issue date.";
    }
  }
  if (values.expiry_date_after && values.expiry_date_before) {
    if (Date.parse(values.expiry_date_after) > Date.parse(values.expiry_date_before)) {
      errors.expiry_date_before = "Must be after expiry date.";
    }
  }
  return errors;
};

export class VarianceSearchForm extends Component {
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
              <Col md={24} xs={24}>
                <Field
                  id="compliance_code"
                  name="compliance_code"
                  placeholder="Select Compliance Code"
                  component={renderConfig.MULTI_SELECT}
                  data={this.props.complianceCodes}
                />
              </Col>
            </Row>
            <Row gutter={6}>
              <Col md={24} xs={24}>
                <Field
                  id="variance_application_status_code"
                  name="variance_application_status_code"
                  placeholder="Select Application Statuses"
                  component={renderConfig.MULTI_SELECT}
                  data={this.props.filterVarianceStatusOptions}
                />
              </Col>
            </Row>
            <Row gutter={6}>
              <Col md={12} xs={24}>
                <Field
                  id="issue_date_after"
                  name="issue_date_after"
                  placeholder="Select Earliest Issue Date"
                  component={renderConfig.DATE}
                />
              </Col>
              <Col md={12} xs={24}>
                <Field
                  id="issue_date_before"
                  name="issue_date_before"
                  placeholder="Select Latest Issue Date"
                  component={renderConfig.DATE}
                />
              </Col>
            </Row>
            <Row gutter={6}>
              <Col md={12} xs={24}>
                <Field
                  id="expiry_date_after"
                  name="expiry_date_after"
                  placeholder="Select Earliest Expiry Date"
                  component={renderConfig.DATE}
                />
              </Col>
              <Col md={12} xs={24}>
                <Field
                  id="expiry_date_before"
                  name="expiry_date_before"
                  placeholder="Select Latest Expiry Date"
                  component={renderConfig.DATE}
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

VarianceSearchForm.propTypes = propTypes;
VarianceSearchForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.VARIANCE_ADVANCED_SEARCH,
  validate,
  touchOnBlur: false,
  enableReinitialize: true,
})(VarianceSearchForm);
