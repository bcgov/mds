import React, { Component } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import PropTypes from "prop-types";
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Form, Button, Col, Row } from "antd";
import {
  getDropdownMineReportCategoryOptions,
  getMineReportDefinitionOptions,
} from "@common/selectors/staticContentSelectors";
import { createDropDownList } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleReset: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  mineReportDefinitionOptions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  dropdownMineReportCategoryOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  selectedMineReportCategory: PropTypes.string,
  selectedMineReportDefinitionGuid: PropTypes.string,
};

const defaultProps = {
  selectedMineReportCategory: undefined,
  selectedMineReportDefinitionGuid: undefined,
};

const selector = formValueSelector(FORM.FILTER_REPORTS);

export class ReportFilterForm extends Component {
  state = {
    dropdownMineReportDefinitionOptionsFiltered: [],
    dropdownMineReportCategoryOptionsFiltered: [],
  };

  handleReset = () => {
    this.props.reset();
    this.props.handleReset();
  };

  updateMineReportDefinitionOptions = (
    mineReportDefinitionOptions,
    selectedMineReportCategory = undefined
  ) => {
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
      dropdownMineReportDefinitionOptionsFiltered,
    });
  };

  updateMineReportCategoryOptions = (
    dropdownMineReportCategoryOptions,
    selectedMineReportDefinitionGuid = undefined
  ) => {
    let dropdownMineReportCategoryOptionsFiltered = dropdownMineReportCategoryOptions;

    if (selectedMineReportDefinitionGuid) {
      const selectedMineReportDefinition = this.props.mineReportDefinitionOptions.filter(
        (option) => option.mine_report_definition_guid === selectedMineReportDefinitionGuid
      )[0];

      dropdownMineReportCategoryOptionsFiltered = dropdownMineReportCategoryOptions.filter((cat) =>
        selectedMineReportDefinition.categories
          .map((category) => category.mine_report_category)
          .includes(cat.value)
      );
    }

    this.setState({
      dropdownMineReportCategoryOptionsFiltered,
    });
  };

  componentWillMount = () => {
    this.updateMineReportDefinitionOptions(this.props.mineReportDefinitionOptions);
    this.updateMineReportCategoryOptions(this.props.dropdownMineReportCategoryOptions);
  };

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.mineReportDefinitionOptions !== this.props.mineReportDefinitionOptions) {
      this.updateMineReportDefinitionOptions(nextProps.mineReportDefinitionOptions);
    }

    if (
      nextProps.dropdownMineReportCategoryOptions !== this.props.dropdownMineReportCategoryOptions
    ) {
      this.updateMineReportCategoryOptions(nextProps.dropdownMineReportCategoryOptions);
    }

    if (nextProps.selectedMineReportCategory !== this.props.selectedMineReportCategory) {
      this.updateMineReportDefinitionOptions(
        nextProps.mineReportDefinitionOptions,
        nextProps.selectedMineReportCategory
      );
    }

    if (
      nextProps.selectedMineReportDefinitionGuid !== this.props.selectedMineReportDefinitionGuid
    ) {
      this.updateMineReportCategoryOptions(
        nextProps.dropdownMineReportCategoryOptions,
        nextProps.selectedMineReportDefinitionGuid
      );
    }
  };

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit} onReset={this.handleReset}>
        <div>
          <Row gutter={16}>
            <Col md={8} sm={24}>
              <Field
                id="report_type"
                name="report_type"
                label="Report Type"
                placeholder="Select the report type"
                component={renderConfig.SELECT}
                data={this.state.dropdownMineReportCategoryOptionsFiltered}
              />
            </Col>
            <Col md={8} sm={24}>
              <Field
                id="report_name"
                name="report_name"
                label="Report Name"
                placeholder="Select the report name"
                component={renderConfig.SELECT}
                data={this.state.dropdownMineReportDefinitionOptionsFiltered}
              />
            </Col>
            <Col md={8} sm={24}>
              <Field
                id="compliance_year"
                name="compliance_year"
                label="Compliance Year"
                placeholder="Select the compliance year"
                component={renderConfig.YEAR}
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col>
              <Form.Item label="Due Date">
                <Row gutter={16}>
                  <Col md={4} sm={24}>
                    <Field
                      id="due_date_start"
                      name="due_date_start"
                      placeholder="Select the start date"
                      component={renderConfig.DATE}
                    />
                  </Col>
                  <Col md={4} sm={24}>
                    <Field
                      id="due_date_end"
                      name="due_date_end"
                      placeholder="Select the end date"
                      component={renderConfig.DATE}
                    />
                  </Col>
                </Row>
              </Form.Item>
            </Col>
          </Row>
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

ReportFilterForm.propTypes = propTypes;
ReportFilterForm.defaultProps = defaultProps;

export default compose(
  connect((state) => ({
    dropdownMineReportCategoryOptions: getDropdownMineReportCategoryOptions(state),
    mineReportDefinitionOptions: getMineReportDefinitionOptions(state),
    selectedMineReportCategory: selector(state, "report_type"),
    selectedMineReportDefinitionGuid: selector(state, "report_name"),
  })),
  reduxForm({
    form: FORM.FILTER_REPORTS,
    touchOnBlur: false,
    enableReinitialize: true,
  })
)(ReportFilterForm);
