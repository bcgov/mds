import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Popconfirm } from "antd";
import CustomPropTypes from "@/customPropTypes";
import * as FORM from "@/constants/forms";
import { ReportSubmissions } from "@/components/Forms/reports/ReportSubmissions";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  mineReport: CustomPropTypes.mineReport.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
};

export class EditReportForm extends Component {
  state = {
    mineReportSubmissions: this.props.mineReport.mine_report_submissions,
  };

  updateMineReportSubmissions = (updatedSubmissions) => {
    this.setState({ mineReportSubmissions: updatedSubmissions }, () =>
      this.props.change("mine_report_submissions", this.state.mineReportSubmissions)
    );
  };

  render() {
    return (
      <FormWrapper
        name={FORM.EDIT_REPORT}
        onSubmit={this.props.handleSubmit}
        reduxFormConfig={{
          touchOnBlur: true,
        }}
      >
        <ReportSubmissions
          mineGuid={this.props.mineGuid}
          mineReportSubmissions={this.state.mineReportSubmissions}
          updateMineReportSubmissions={this.updateMineReportSubmissions}
          showUploadedFiles
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
            Add Documents
          </Button>
        </div>
      </FormWrapper>
    );
  }
}

EditReportForm.propTypes = propTypes;

export default EditReportForm;
