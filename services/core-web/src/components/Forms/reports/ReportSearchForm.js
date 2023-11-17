import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { compose } from "redux";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { isEmpty, some, negate } from "lodash";
import { Field, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row } from "antd";
import {
  getDropdownMineReportStatusOptions,
  getDropdownMineReportCategoryOptions,
  getDropdownMineReportDefinitionOptions,
  getMineRegionDropdownOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { sortListObjectsByPropertyLocaleCompare } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleReset: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  mineRegionOptions: CustomPropTypes.options.isRequired,
  dropdownMineReportStatusOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  dropdownMineReportDefinitionOptions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any))
    .isRequired,
  dropdownMineReportCategoryOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
};

export class ReportSearchForm extends Component {
  state = {
    receivedFirstInitialValues: false,
    expandAdvancedSearch: false,
  };

  handleReset = () => {
    this.props.reset();
    this.props.handleReset();
  };

  toggleIsAdvancedSearch = () =>
    this.setState((prevState) => ({
      expandAdvancedSearch: !prevState.expandAdvancedSearch,
    }));

  haveAdvancedSearchFilters = ({
    report_type,
    report_name,
    due_date_after,
    due_date_before,
    received_date_after,
    received_date_before,
    received_only,
    compliance_year,
    status,
    requested_by,
    major,
    region,
  }) =>
    due_date_after ||
    due_date_before ||
    received_date_after ||
    received_date_before ||
    received_only ||
    compliance_year ||
    requested_by ||
    major ||
    some([report_type, report_name, status, region], negate(isEmpty));

  componentWillReceiveProps = (nextProps) => {
    if (
      !this.state.receivedFirstInitialValues &&
      this.props.initialValues !== nextProps.initialValues
    ) {
      this.setState({
        receivedFirstInitialValues: true,
        expandAdvancedSearch: this.haveAdvancedSearchFilters(nextProps.initialValues),
      });
    }
  };

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit} onReset={this.handleReset}>
        <Row gutter={6}>
          <Col md={24} xs={24}>
            <Field
              id="search"
              name="search"
              placeholder="Search by mine name or number"
              component={renderConfig.FIELD}
              allowClear
            />
          </Col>
        </Row>
        {this.state.expandAdvancedSearch && (
          <div>
            <Row gutter={6}>
              <Col md={12} xs={24}>
                <Field
                  id="report_type"
                  name="report_type"
                  placeholder="Select Report Type"
                  component={renderConfig.MULTI_SELECT}
                  data={this.props.dropdownMineReportCategoryOptions}
                />
              </Col>
              <Col md={12} xs={24}>
                <Field
                  id="report_name"
                  name="report_name"
                  placeholder="Select Report Name"
                  component={renderConfig.MULTI_SELECT}
                  data={sortListObjectsByPropertyLocaleCompare(
                    this.props.dropdownMineReportDefinitionOptions,
                    "label"
                  )}
                />
              </Col>
            </Row>
            <Row gutter={6}>
              <Col md={12} xs={24}>
                <Field
                  id="due_date_after"
                  name="due_date_after"
                  placeholder="Select Earliest Due Date"
                  component={renderConfig.DATE}
                  format={null}
                />
              </Col>
              <Col md={12} xs={24}>
                <Field
                  id="due_date_before"
                  name="due_date_before"
                  placeholder="Select Latest Due Date"
                  component={renderConfig.DATE}
                  format={null}
                />
              </Col>
            </Row>
            <Row gutter={6}>
              <Col md={8} xs={24}>
                <Field
                  id="received_date_after"
                  name="received_date_after"
                  placeholder="Select Earliest Received Date"
                  component={renderConfig.DATE}
                  format={null}
                />
              </Col>
              <Col md={8} xs={24}>
                <Field
                  id="received_date_before"
                  name="received_date_before"
                  placeholder="Select Latest Received Date"
                  component={renderConfig.DATE}
                  format={null}
                />
              </Col>
              <Col md={8} xs={24}>
                <Field
                  id="received_only"
                  name="received_only"
                  component={renderConfig.SELECT}
                  data={[
                    { value: "", label: "Received Only" },
                    { value: "false", label: "Received and Unreceived" },
                  ]}
                />
              </Col>
            </Row>
            <Row gutter={6}>
              <Col md={12} xs={24}>
                <Field
                  id="compliance_year"
                  name="compliance_year"
                  placeholder="Select Compliance Year"
                  component={renderConfig.YEAR}
                  format={null}
                />
              </Col>
              <Col md={12} xs={24}>
                <Field
                  id="status"
                  name="status"
                  placeholder="Select Report Status"
                  component={renderConfig.MULTI_SELECT}
                  data={this.props.dropdownMineReportStatusOptions}
                />
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24}>
                <Field
                  id="requested_by"
                  name="requested_by"
                  placeholder="Search Requested By"
                  component={renderConfig.FIELD}
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
          <Button className="btn--dropdown" onClick={this.toggleIsAdvancedSearch}>
            {this.state.expandAdvancedSearch ? "Collapse Filters" : "Expand Filters"}
            {this.state.expandAdvancedSearch ? <UpOutlined /> : <DownOutlined />}
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

ReportSearchForm.propTypes = propTypes;

export default compose(
  connect((state) => ({
    mineRegionOptions: getMineRegionDropdownOptions(state),
    dropdownMineReportStatusOptions: getDropdownMineReportStatusOptions(state, false),
    dropdownMineReportCategoryOptions: getDropdownMineReportCategoryOptions(state, false),
    dropdownMineReportDefinitionOptions: getDropdownMineReportDefinitionOptions(state, false),
  })),
  reduxForm({
    form: FORM.REPORT_ADVANCED_SEARCH,
    touchOnBlur: false,
    enableReinitialize: true,
  })
)(ReportSearchForm);
