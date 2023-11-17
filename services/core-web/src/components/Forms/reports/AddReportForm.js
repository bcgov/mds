/* eslint-disable */
import React, { Component } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import PropTypes from "prop-types";
import { flatMap, uniqBy } from "lodash";
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm, List } from "antd";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import { required, date } from "@common/utils/Validate";
import {
  resetForm,
  createDropDownList,
  formatComplianceCodeValueOrLabel,
  sortListObjectsByPropertyLocaleCompare,
} from "@common/utils/helpers";
import {
  getDropdownMineReportCategoryOptions,
  getMineReportDefinitionOptions,
  getDropdownMineReportStatusOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import CustomPropTypes from "@/customPropTypes";
import { ReportSubmissions } from "@/components/Forms/reports/ReportSubmissions";
import ReportComments from "@/components/Forms/reports/ReportComments";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.objectOf(PropTypes.any)]).isRequired,
  mineReportDefinitionOptions: PropTypes.arrayOf(PropTypes.any).isRequired,
  dropdownMineReportCategoryOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any),
  selectedMineReportCategory: PropTypes.string,
  selectedMineReportDefinition: PropTypes.string,
  mineReportStatusOptions: CustomPropTypes.options.isRequired,
  formMeta: PropTypes.any,
  showReportHistory: PropTypes.func.isRequired,
};

const selector = formValueSelector(FORM.ADD_REPORT);

const defaultProps = {
  initialValues: {},
  selectedMineReportDefinition: undefined,
  selectedMineReportCategory: undefined,
};

const requiredReceivedDateIfUploadedFiles = (value, formValues) =>
  formValues.mine_report_submissions && formValues.mine_report_submissions.length > 0 && !value
    ? "Received date must be set if files are attached"
    : undefined;

export class AddReportForm extends Component {
  state = {
    existingReport: Boolean(this.props.initialValues.mine_report_definition_guid),
    mineReportDefinitionOptionsFiltered: [],
    dropdownMineReportDefinitionOptionsFiltered: [],
    selectedMineReportComplianceArticles: [],
    mineReportSubmissions: this.props.initialValues.mine_report_submissions,
  };

  componentWillMount = () => {
    if (this.props.initialValues.mine_report_definition_guid) {
      this.updateMineReportDefinitionOptions(this.props.mineReportDefinitionOptions);
      this.updateSelectedMineReportComplianceArticles(
        this.props.initialValues.mine_report_definition_guid
      );
    }
  };

  updateMineReportDefinitionOptions = (mineReportDefinitionOptions, selectedMineReportCategory) => {
    let mineReportDefinitionOptionsFiltered = mineReportDefinitionOptions.filter(
      (option) => option.active_ind
    );

    if (selectedMineReportCategory) {
      mineReportDefinitionOptionsFiltered = mineReportDefinitionOptionsFiltered.filter(
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

  updateDueDateWithDefaultDueDate = (mineReportDefinitionGuid) => {
    let formMeta = this.props.formMeta;
    if (
      !(formMeta && formMeta.fields && formMeta.fields.due_date && formMeta.fields.due_date.touched)
    ) {
      this.props.change(
        "due_date",
        this.props.mineReportDefinitionOptions.find(
          (x) => x.mine_report_definition_guid === mineReportDefinitionGuid
        ).default_due_date
      );
    }
  };

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.selectedMineReportDefinition !== this.props.selectedMineReportDefinition) {
      this.updateSelectedMineReportComplianceArticles(nextProps.selectedMineReportDefinition);
    }
    if (nextProps.initialValues !== this.props.initialValues) {
      this.updateMineReportDefinitionOptions(nextProps.mineReportDefinitionOptions);
      this.updateSelectedMineReportComplianceArticles(
        nextProps.initialValues.mine_report_definition_guid
      );
    }
    if (nextProps.selectedMineReportCategory !== this.props.selectedMineReportCategory) {
      this.updateMineReportDefinitionOptions(
        nextProps.mineReportDefinitionOptions,
        nextProps.selectedMineReportCategory
      );
    }
  };

  updateMineReportSubmissions = (updatedSubmissions) => {
    this.setState({ mineReportSubmissions: updatedSubmissions }, () =>
      this.props.change("mine_report_submissions", this.state.mineReportSubmissions)
    );
  };

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={16}>
          <Col span={24}>
            {!this.props.initialValues.mine_report_definition_guid && (
              <Form.Item>
                <Field
                  id="mine_report_category"
                  name="mine_report_category"
                  label="Report Type*"
                  placeholder="Select report type"
                  data={this.props.dropdownMineReportCategoryOptions}
                  doNotPinDropdown
                  component={renderConfig.SELECT}
                  validate={[required]}
                  format={null}
                />
              </Form.Item>
            )}
            <Form.Item>
              <Field
                id="mine_report_definition_guid"
                name="mine_report_definition_guid"
                label="Report Name*"
                placeholder={
                  this.props.selectedMineReportCategory
                    ? "Select report name"
                    : "Select report type above"
                }
                data={this.state.dropdownMineReportDefinitionOptionsFiltered}
                doNotPinDropdown
                component={renderConfig.SELECT}
                validate={[required]}
                format={null}
                onChange={this.updateDueDateWithDefaultDueDate}
                props={{
                  disabled: this.state.existingReport || !this.props.selectedMineReportCategory,
                }}
              />
            </Form.Item>
            {this.props.selectedMineReportCategory && this.props.selectedMineReportDefinition && (
              <Form.Item label="Report Code Requirements">
                <List
                  bordered
                  size={
                    this.state.selectedMineReportComplianceArticles.length > 0 ? "small" : "large"
                  }
                >
                  {this.state.selectedMineReportComplianceArticles.length
                    ? this.state.selectedMineReportComplianceArticles.map((opt, index) => (
                        <List.Item key={index}>
                          {formatComplianceCodeValueOrLabel(opt, true)}
                        </List.Item>
                      ))
                    : [<List.Item key={1} />]}
                </List>
              </Form.Item>
            )}
            <Form.Item>
              <Field
                id="submission_year"
                name="submission_year"
                label="Compliance Year*"
                placeholder="Select compliance year"
                component={renderConfig.YEAR}
                validate={[required]}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="due_date"
                name="due_date"
                label="Due Date*"
                placeholder="Select due date"
                component={renderConfig.DATE}
                validate={[required, date]}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="received_date"
                name="received_date"
                label="Received Date"
                placeholder="Select received date"
                component={renderConfig.DATE}
                validate={[requiredReceivedDateIfUploadedFiles, date]}
              />
            </Form.Item>
            <ReportSubmissions
              mineGuid={this.props.mineGuid}
              mineReportSubmissions={this.state.mineReportSubmissions}
              updateMineReportSubmissions={this.updateMineReportSubmissions}
              showReportHistory={this.props.showReportHistory}
              mineReportStatusOptions={this.props.mineReportStatusOptions}
            />
            {this.state.existingReport &&
              this.state.mineReportSubmissions.filter((x) => x.mine_report_submission_guid).length >
                0 && (
                <ReportComments
                  mineGuid={this.props.mineGuid}
                  mineReportGuid={this.props.initialValues.mine_report_guid}
                  handleSubmit={this.props.handleCommentSubmit}
                />
              )}
          </Col>
        </Row>
        <div className="right center-mobile">
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to cancel?"
            onConfirm={this.props.closeModal}
            okText="Yes"
            cancelText="No"
            disabled={this.props.submitting}
          >
            <Button className="full-mobile" type="secondary" disabled={this.props.submitting}>
              Cancel
            </Button>
          </Popconfirm>
          <Button
            className="full-mobile"
            type="primary"
            htmlType="submit"
            loading={this.props.submitting}
          >
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
    mineReportStatusOptions: getDropdownMineReportStatusOptions(state),
    selectedMineReportCategory: selector(state, "mine_report_category"),
    selectedMineReportDefinition: selector(state, "mine_report_definition_guid"),
    formMeta: state.form[FORM.ADD_REPORT],
  })),
  reduxForm({
    form: FORM.ADD_REPORT,
    touchOnBlur: false,
    enableReinitialize: true,
    onSubmitSuccess: resetForm(FORM.ADD_REPORT),
  })
)(AddReportForm);
