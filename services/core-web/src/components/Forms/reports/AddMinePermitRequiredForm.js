import React, { Component } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import PropTypes from "prop-types";
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm } from "antd";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import { required, date } from "@common/utils/Validate";
import { resetForm, createDropDownList } from "@common/utils/helpers";
import {
  getDropdownPermitConditionCategoryOptions,
  getDropdownMineReportStatusOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import CustomPropTypes from "@/customPropTypes";
import { ReportSubmissions } from "@/components/Forms/reports/ReportSubmissions";
import ReportComments from "@/components/Forms/reports/ReportComments";
import { fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.objectOf(PropTypes.any)]).isRequired,
  dropdownPermitConditionCategoryOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem)
    .isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  initialValues: PropTypes.objectOf(PropTypes.any),
  mineReportStatusOptions: CustomPropTypes.options.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  showReportHistory: PropTypes.func.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  change: PropTypes.func,
  submitting: PropTypes.bool.isRequired,
};

const selector = formValueSelector(FORM.ADD_REPORT);

const defaultProps = {
  initialValues: {},
  change: () => {},
};

const requiredReceivedDateIfUploadedFiles = (value, formValues) =>
  formValues.mine_report_submissions && formValues.mine_report_submissions.length > 0 && !value
    ? "Received date must be set if files are attached"
    : undefined;

export class AddMinePermitRequiredForm extends Component {
  state = {
    existingReport: Boolean(
      this.props.initialValues.mine_report_submissions &&
        this.props.initialValues.mine_report_submissions.length > 0
    ),
    mineReportSubmissions: this.props.initialValues.mine_report_submissions,
  };

  componentDidMount = () => {
    this.props.fetchPermits(this.props.mineGuid);
  };

  updateMineReportSubmissions = (updatedSubmissions) => {
    this.setState({ mineReportSubmissions: updatedSubmissions }, () =>
      this.props.change("mine_report_submissions", this.state.mineReportSubmissions)
    );
  };

  render() {
    const permitDropdown = createDropDownList(this.props.permits, "permit_no", "permit_guid");

    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item>
              <Field
                id="permit_guid"
                name="permit_guid"
                placeholder="Select a Permit"
                label="Permit*"
                component={renderConfig.SELECT}
                data={permitDropdown}
                validate={[required]}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="permit_condition_category_code"
                name="permit_condition_category_code"
                label="Report Type*"
                placeholder="Select report type"
                data={this.props.dropdownPermitConditionCategoryOptions}
                doNotPinDropdown
                component={renderConfig.SELECT}
                validate={[required]}
              />
            </Form.Item>
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

AddMinePermitRequiredForm.propTypes = propTypes;
AddMinePermitRequiredForm.defaultProps = defaultProps;

export default compose(
  connect((state) => ({
    dropdownPermitConditionCategoryOptions: getDropdownPermitConditionCategoryOptions(state),
    mineReportStatusOptions: getDropdownMineReportStatusOptions(state),
    selectedMineReportCategory: selector(state, "permit_condition_category_code"),
    fetchPermits,
    permits: getPermits(state),
  })),
  reduxForm({
    form: FORM.ADD_REPORT,
    touchOnBlur: false,
    enableReinitialize: true,
    onSubmitSuccess: resetForm(FORM.ADD_REPORT),
  })
)(AddMinePermitRequiredForm);
