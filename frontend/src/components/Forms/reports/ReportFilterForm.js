/* eslint-disable */
import React, { Component } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import PropTypes from "prop-types";
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Form, Button, Col, Icon, Row } from "antd";
import * as FORM from "@/constants/forms";
import {
  getDropdownMineReportCategoryOptions,
  getMineReportDefinitionOptions,
} from "@/selectors/staticContentSelectors";
import { createDropDownList } from "@/utils/helpers";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  mineReportDefinitionOptions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  dropdownMineReportCategoryOptions: PropTypes.arrayOf(
    PropTypes.objectOf(CustomPropTypes.dropdownListItem)
  ).isRequired,
  selectedMineReportCategory: PropTypes.string.isRequired,
};

const defaultProps = {};

const selector = formValueSelector(FORM.FILTER_REPORTS);

export class ReportFilterForm extends Component {
  state = {
    mineReportDefinitionOptionsFiltered: [],
    dropdownMineReportDefinitionOptionsFiltered: [],
  };

  componentDidMount = () => {
    this.updateMineReportOptions(this.props.mineReportDefinitionOptions);
  };

  updateMineReportOptions = (mineReportDefinitionOptions, selectedMineReportCategory) => {
    let mineReportDefinitionOptionsFiltered = mineReportDefinitionOptions;

    if (selectedMineReportCategory) {
      mineReportDefinitionOptionsFiltered = mineReportDefinitionOptions.filter(
        (rd) =>
          rd.categories.filter((c) => c.mine_report_category === selectedMineReportCategory)
            .length > 0
      );
    }

    const dropdownMineReportDefinitionOptionsFiltered = createDropDownList(
      mineReportDefinitionOptionsFiltered,
      "report_name",
      "mine_report_definition_guid"
    );

    this.setState({
      mineReportDefinitionOptionsFiltered,
      dropdownMineReportDefinitionOptionsFiltered,
    });
  };

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.selectedMineReportCategory !== this.props.selectedMineReportCategory) {
      this.updateMineReportOptions(
        nextProps.mineReportDefinitionOptions,
        nextProps.selectedMineReportCategory
      );
    }
  };

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit} onReset={this.handleReset}>
        <div>
          <Row gutter={16}>
            <Col md={6} xs={24}>
              <Field
                id="reportName"
                name="reportName"
                label="Report Name"
                placeholder="Start typing a report name"
                component={renderConfig.SELECT}
                data={this.state.dropdownMineReportDefinitionOptionsFiltered}
              />
            </Col>
            <Col md={6} xs={24}>
              <Field
                id="reportType"
                name="reportType"
                label="Report Type"
                placeholder="Select a report type"
                component={renderConfig.SELECT}
                data={this.props.dropdownMineReportCategoryOptions}
              />
            </Col>
            <Col md={3} xs={24}>
              <Field
                id="complianceStartYear"
                name="complianceStartYear"
                label="Compliance Year"
                placeholder="Start date"
                component={renderConfig.FIELD}
              />
            </Col>
            <Col md={3} xs={24}>
              <Field
                id="complianceEndYear"
                name="complianceEndYear"
                label=" "
                placeholder="End date"
                component={renderConfig.FIELD}
              />
            </Col>
            <Col md={6} xs={24}>
              <Field
                id="requestedBy"
                name="requestedBy"
                label="Requested by"
                placeholder="Start typing an inspector name"
                component={renderConfig.SELECT}
              />
            </Col>
          </Row>
          <Row gutter={6}>
            <label>Report Due Date Range</label>
            <Col md={3} xs={24}>
              <Field
                id="reportDueDateStart"
                name="reportDueDateStart"
                placeholder="Start date"
                component={renderConfig.FIELD}
              />
            </Col>
            -
            <Col md={3} xs={24}>
              <Field
                id="reportDueDateEnd"
                name="reportDueDateEnd"
                placeholder="End date"
                component={renderConfig.FIELD}
              />
            </Col>
          </Row>
        </div>
        <div className="right center-mobile">
          <Button className="full-mobile" type="secondary" htmlType="reset">
            Clear Filters
          </Button>
          <Button className="full-mobile" type="primary" htmlType="submit">
            Filter Reports
          </Button>
        </div>
      </Form>
    );
  }
}

ReportFilterForm.propTypes = propTypes;
ReportFilterForm.defaultProps = defaultProps;

export default compose(
  connect((state) => ({
    dropdownMineReportCategoryOptions: getDropdownMineReportCategoryOptions(state),
    mineReportDefinitionOptions: getMineReportDefinitionOptions(state),
    selectedMineReportCategory: selector(state, "reportType"),
    selectedMineReportDefinition: selector(state, "reportName"),
  })),
  reduxForm({
    form: FORM.FILTER_REPORTS,
    touchOnBlur: true,
  })
)(ReportFilterForm);
