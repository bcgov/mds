import React, { Component } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import PropTypes from "prop-types";
import { flatMap, uniqBy, concat, reject } from "lodash";
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Form, Button, Col, Row, Popconfirm, List } from "antd";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import { required } from "@/utils/Validate";
import { resetForm, createDropDownList, formatComplianceCodeValueOrLabel } from "@/utils/helpers";
import { ReportsUploadedFilesList } from "@/components/Forms/reports/ReportsUploadedFilesList";
import { MINE_REPORT_DOCUMENT } from "@/constants/API";
import {
  getDropdownMineReportCategoryOptions,
  getMineReportDefinitionOptions,
} from "@/selectors/staticContentSelectors";
import CustomPropTypes from "@/customPropTypes";
import FileUpload from "@/components/common/FileUpload";

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
  selectedMineReportCategory: PropTypes.string.isRequired,
  selectedMineReportDefinition: PropTypes.string.isRequired,
};

const selector = formValueSelector(FORM.ADD_REPORT);

const defaultProps = { initialValues: {} };

export class AddReportForm extends Component {
  state = {
    existingReport: Boolean(!this.props.initialValues.mine_report_definition_guid),
    mineReportDefinitionOptionsFiltered: [],
    dropdownMineReportDefinitionOptionsFiltered: [],
    selectedMineReportComplianceArticles: [],
    uploadedFiles:
      this.props.initialValues.mine_report_submissions &&
      this.props.initialValues.mine_report_submissions[0].documents.length > 0
        ? [...this.props.initialValues.mine_report_submissions[0].documents]
        : [],
  };

  componentDidMount = () => {
    if (this.props.initialValues.mine_report_definition_guid) {
      this.updateMineReportOptions(this.props.mineReportDefinitionOptions);

      this.updateSelectedMineReportComplianceArticles(
        this.props.initialValues.mine_report_definition_guid
      );
    }
  };

  componentDidMount = () => {
    if (this.props.initialValues.mine_report_definition_guid) {
      this.updateMineReportOptions(this.props.mineReportDefinitionOptions);

      this.updateSelectedMineReportComplianceArticles(
        this.props.initialValues.mine_report_definition_guid
      );
    }
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
      this.updateMineReportOptions(
        nextProps.mineReportDefinitionOptions,
        nextProps.selectedMineReportCategory
      );
    }

    if (nextProps.selectedMineReportDefinition !== this.props.selectedMineReportDefinition) {
      this.updateSelectedMineReportComplianceArticles(nextProps.selectedMineReportDefinition);
    }
  };

  // handleReportSubmit = () => {
  //   this.props.onSubmit({
  //     ...this.props.addReportFormValues,
  //     updated_documents: this.state.uploadedFiles,
  //   });
  //   // TODO: Catch error
  //   this.close();
  // };

  close = () => {
    this.props.closeModal();
  };

  onFileLoad = (document_name, document_manager_guid) =>
    this.setState((prevState) => ({
      uploadedFiles: concat(prevState.uploadedFiles, {
        document_name,
        document_manager_guid,
      }),
    }));

  onRemoveFile = (file) => {
    this.setState((prevState) => ({
      uploadedFiles: reject(
        prevState.uploadedFiles,
        (uploadedFile) => file.document_manager_guid === uploadedFile.document_manager_guid
      ),
    }));
  };

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={16}>
          <Col>
            {!this.props.initialValues.mine_report_definition_guid && (
              <Form.Item>
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
              </Form.Item>
            )}
            <Form.Item>
              <Field
                id="mine_report_definition_guid"
                name="mine_report_definition_guid"
                label="Report Name*"
                placeholder={
                  this.props.selectedMineReportCategory ? "Select" : "Select a category above"
                }
                data={this.state.dropdownMineReportDefinitionOptionsFiltered}
                doNotPinDropdown
                component={renderConfig.SELECT}
                validate={[required]}
                props={{ disabled: !this.props.selectedMineReportCategory }}
              />
            </Form.Item>
            <Form.Item label="Report Code Requirements">
              <List
                bordered
                size={
                  this.state.selectedMineReportComplianceArticles.length > 0 ? "small" : "large"
                }
              >
                {this.state.selectedMineReportComplianceArticles.length
                  ? this.state.selectedMineReportComplianceArticles.map((opt) => (
                      <List.Item>{formatComplianceCodeValueOrLabel(opt, true)}</List.Item>
                    ))
                  : [<List.Item />]}
              </List>
            </Form.Item>
            <Form.Item />
            <Form.Item>
              <Field
                id="submission_year"
                name="submission_year"
                label="Report Compliance Year/Period"
                placeholder=""
                component={renderConfig.YEAR}
                validate={[required]}
                props={{ disabled: !this.state.existingReport }}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="due_date"
                name="due_date"
                label="Due Date"
                placeholder=""
                component={renderConfig.DATE}
                validate={[required]}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="received_date"
                name="received_date"
                label="Received Date"
                placeholder=""
                component={renderConfig.DATE}
              />
            </Form.Item>
            {this.state.uploadedFiles.length > 0 && (
              <Form.Item label="Attached files" style={{ paddingBottom: "10px" }}>
                <Field
                  id="report_documents"
                  name="report_documents"
                  component={ReportsUploadedFilesList}
                  files={this.state.uploadedFiles}
                  onRemoveFile={this.onRemoveFile}
                />
              </Form.Item>
            )}
            <Form.Item>
              <Field
                id="ReportFileUpload"
                name="ReportFileUpload"
                label="Upload Files"
                onFileLoad={(document_name, document_manager_guid) =>
                  this.onFileLoad(document_name, document_manager_guid)
                }
                uploadUrl={MINE_REPORT_DOCUMENT(this.props.mineGuid)}
                component={FileUpload}
              />
            </Form.Item>
          </Col>
        </Row>
        <div className="right center-mobile">
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to cancel?"
            onConfirm={this.props.closeModal}
            okText="Yes"
            cancelText="No"
          >
            <Button className="full-mobile" type="secondary">
              Cancel
            </Button>
          </Popconfirm>
          <Button className="full-mobile" type="primary" htmlType="submit">
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
  })),
  reduxForm({
    form: FORM.ADD_REPORT,
    touchOnBlur: true,
    onSubmitSuccess: resetForm(FORM.ADD_REPORT),
  })
)(AddReportForm);
