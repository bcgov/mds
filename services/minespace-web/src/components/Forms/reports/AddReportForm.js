/* eslint-disable */
import React, { Component } from "react";
import moment from "moment";
import { connect } from "react-redux";
import { compose } from "redux";
import PropTypes from "prop-types";
import { flatMap, uniqBy } from "lodash";
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Popconfirm, List, Typography } from "antd";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import { required, yearNotInFuture } from "@common/utils/Validate";
import {
  resetForm,
  createDropDownList,
  formatComplianceCodeValueOrLabel,
  sortListObjectsByPropertyLocaleCompare,
} from "@common/utils/helpers";
import {
  getDropdownMineReportCategoryOptions,
  getMineReportDefinitionOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import CustomPropTypes from "@/customPropTypes";
import { ReportSubmissions } from "@/components/Forms/reports/ReportSubmissions";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  mineReportDefinitionOptions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  dropdownMineReportCategoryOptions: PropTypes.arrayOf(
    PropTypes.objectOf(CustomPropTypes.dropdownListItem)
  ).isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any),
  selectedMineReportCategory: PropTypes.string,
  selectedMineReportDefinition: PropTypes.string,
  formMeta: PropTypes.any,
};

const selector = formValueSelector(FORM.ADD_REPORT);

const defaultProps = {
  initialValues: {},
  selectedMineReportCategory: null,
  selectedMineReportDefinition: null,
};

export class AddReportForm extends Component {
  state = {
    existingReport: Boolean(!this.props.initialValues.mine_report_definition_guid),
    mineReportDefinitionOptionsFiltered: [],
    dropdownMineReportDefinitionOptionsFiltered: [],
    selectedMineReportComplianceArticles: [],
    mineReportSubmissions: this.props.initialValues.mine_report_submissions,
  };

  componentDidMount = () => {
    if (this.props.initialValues.mine_report_definition_guid) {
      this.updateMineReportDefinitionOptions(this.props.mineReportDefinitionOptions);

      this.updateSelectedMineReportComplianceArticles(
        this.props.initialValues.mine_report_definition_guid
      );
    }
  };

  updateMineReportDefinitionOptions = (mineReportDefinitionOptions, selectedMineReportCategory) => {
    let mineReportDefinitionOptionsFiltered = mineReportDefinitionOptions;

    if (selectedMineReportCategory) {
      mineReportDefinitionOptionsFiltered = mineReportDefinitionOptions.filter(
        (rd) =>
          rd.categories.filter((c) => c.mine_report_category === selectedMineReportCategory)
            .length > 0
      );
    }

    let dropdownMineReportDefinitionOptionsFiltered = createDropDownList(
      mineReportDefinitionOptionsFiltered,
      "report_name",
      "mine_report_definition_guid"
    );
    dropdownMineReportDefinitionOptionsFiltered = sortListObjectsByPropertyLocaleCompare(
      dropdownMineReportDefinitionOptionsFiltered,
      "label"
    );

    this.setState({
      mineReportDefinitionOptionsFiltered,
      dropdownMineReportDefinitionOptionsFiltered,
    });
  };

  updateSelectedMineReportComplianceArticles = (selectedMineReportDefinition) => {
    this.setState((prevState) => ({
      selectedMineReportComplianceArticles: uniqBy(
        flatMap(
          prevState.mineReportDefinitionOptionsFiltered.filter(
            (x) => x.mine_report_definition_guid === selectedMineReportDefinition
          ),
          "compliance_articles"
        ),
        "compliance_article_id"
      ),
    }));
  };

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.selectedMineReportCategory !== this.props.selectedMineReportCategory) {
      this.updateMineReportDefinitionOptions(
        nextProps.mineReportDefinitionOptions,
        nextProps.selectedMineReportCategory
      );
    }

    if (nextProps.selectedMineReportDefinition !== this.props.selectedMineReportDefinition) {
      this.updateSelectedMineReportComplianceArticles(nextProps.selectedMineReportDefinition);
    }
  };

  updateMineReportSubmissions = (updatedSubmissions) => {
    this.setState({ mineReportSubmissions: updatedSubmissions });
    this.props.change("mine_report_submissions", this.state.mineReportSubmissions);
  };

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        {!this.props.initialValues.mine_report_definition_guid && (
          <Field
            id="mine_report_category"
            name="mine_report_category"
            label="Report Type*"
            placeholder="Select"
            data={this.props.dropdownMineReportCategoryOptions}
            doNotPinDropdown
            component={renderConfig.SELECT}
            validate={[required]}
          />
        )}

        <Field
          id="mine_report_definition_guid"
          name="mine_report_definition_guid"
          label="Report Name*"
          placeholder={this.props.selectedMineReportCategory ? "Select" : "Select a category above"}
          data={this.state.dropdownMineReportDefinitionOptionsFiltered}
          doNotPinDropdown
          component={renderConfig.SELECT}
          validate={[required]}
          onChange={this.updateDueDateWithDefaultDueDate}
          props={{ disabled: !this.props.selectedMineReportCategory }}
        />

        <Form.Item label="Report Code Requirements">
          {this.state.selectedMineReportComplianceArticles.length > 0 ? (
            <List bordered size="small" className="color-primary">
              {this.state.selectedMineReportComplianceArticles.map((opt) => (
                <List.Item key={opt}>{formatComplianceCodeValueOrLabel(opt, true)}</List.Item>
              ))}
            </List>
          ) : (
            <Typography.Paragraph>
              Select the report type and name to view the required codes.
            </Typography.Paragraph>
          )}
        </Form.Item>
        <Field
          id="submission_year"
          name="submission_year"
          label={
            <span>
              <div style={{ paddingBottom: 8 }}>Report Compliance Year/Period*</div>
              <Typography.Text>
                Select the year for which the report is being submitted. Depending on the report,
                this may not be the current calendar year.
              </Typography.Text>
            </span>
          }
          component={renderConfig.YEAR}
          validate={[required, yearNotInFuture]}
          disabledDate={(currentDate) => currentDate.year() > moment().year}
        />
        <ReportSubmissions
          mineGuid={this.props.mineGuid}
          mineReportSubmissions={this.state.mineReportSubmissions}
          updateMineReportSubmissions={this.updateMineReportSubmissions}
        />
        <div className="ant-modal-footer">
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to cancel?"
            onConfirm={this.props.closeModal}
            okText="Yes"
            cancelText="No"
            disabled={this.props.submitting}
          >
            <Button disabled={this.props.submitting}>Cancel</Button>
          </Popconfirm>
          <Button type="primary" htmlType="submit" loading={this.props.submitting}>
            {this.props.title}
          </Button>
        </div>
      </Form>
    );
  }
}

AddReportForm.propTypes = propTypes;
AddReportForm.defaultProps = defaultProps;

export default compose(
  connect((state) => ({
    dropdownMineReportCategoryOptions: getDropdownMineReportCategoryOptions(state),
    mineReportDefinitionOptions: getMineReportDefinitionOptions(state),
    selectedMineReportCategory: selector(state, "mine_report_category"),
    selectedMineReportDefinition: selector(state, "mine_report_definition_guid"),
    formMeta: state.form[FORM.ADD_REPORT],
  })),
  reduxForm({
    form: FORM.ADD_REPORT,
    touchOnBlur: true,
    onSubmitSuccess: resetForm(FORM.ADD_REPORT),
  })
)(AddReportForm);
