/* eslint-disable */
import React, { Component } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import PropTypes from "prop-types";
import { flatMap, uniqBy } from "lodash";
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Form, Button, Popconfirm, List, Typography } from "antd";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import { required } from "@/utils/Validate";
import { resetForm, createDropDownList, formatComplianceCodeValueOrLabel } from "@/utils/helpers";
import {
  getDropdownMineReportCategoryOptions,
  getMineReportDefinitionOptions,
} from "@/selectors/staticContentSelectors";
import CustomPropTypes from "@/customPropTypes";
import { ReportSubmissions } from "@/components/Forms/reports/ReportSubmissions";

const { Paragraph } = Typography;

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

export class EditReportForm extends Component {
  state = {
    existingReport: Boolean(!this.props.initialValues.mine_report_definition_guid),
    mineReportDefinitionOptionsFiltered: [],
    dropdownMineReportDefinitionOptionsFiltered: [],
    selectedMineReportComplianceArticles: [],
    mineReportSubmissions: this.props.initialValues.mine_report_submissions,
  };

  componentDidMount = () => {
    if (this.props.initialValues.mine_report_definition_guid) {
      this.updateMineReportOptions(this.props.mineReportDefinitionOptions);

      this.updateSelectedMineReportComplianceArticles(
        this.props.initialValues.mine_report_definition_guid
      );
    }
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

  updateMineReportSubmissions = (updatedSubmissions) => {
    this.setState({ mineReportSubmissions: updatedSubmissions });
    this.props.change("mine_report_submissions", this.state.mineReportSubmissions);
  };

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Form.Item label="Report Code Requirements">
          {this.state.selectedMineReportComplianceArticles.length > 0 ? (
            <List bordered size="small" className="color-primary">
              {this.state.selectedMineReportComplianceArticles.map((opt) => (
                <List.Item>{formatComplianceCodeValueOrLabel(opt, true)}</List.Item>
              ))}
            </List>
          ) : (
            <Paragraph>Select the report type and name to view the required codes.</Paragraph>
          )}
        </Form.Item>
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
          >
            <Button>Cancel</Button>
          </Popconfirm>
          <Button type="primary" htmlType="submit">
            {this.props.title}
          </Button>
        </div>
      </Form>
    );
  }
}

EditReportForm.propTypes = propTypes;
EditReportForm.defaultProps = defaultProps;

export default compose(
  connect((state) => ({
    dropdownMineReportCategoryOptions: getDropdownMineReportCategoryOptions(state),
    mineReportDefinitionOptions: getMineReportDefinitionOptions(state),
    selectedMineReportCategory: selector(state, "mine_report_category"),
    selectedMineReportDefinition: selector(state, "mine_report_definition_guid"),
    formMeta: state.form[FORM.ADD_REPORT],
  })),
  reduxForm({
    form: FORM.EDIT_REPORT,
    touchOnBlur: true,
    onSubmitSuccess: resetForm(FORM.EDIT_REPORT),
  })
)(EditReportForm);
