import React, { Component } from "react";
import PropTypes from "prop-types";
import { reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Popconfirm } from "antd";
import CustomPropTypes from "@mds/common/customPropTypes";
import * as FORM from "@mds/common/constants/forms";
import { ReportSubmissions } from "@mds/common/components/reports/ReportSubmissions";

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
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
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
      </Form>
    );
  }
}

EditReportForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.EDIT_REPORT,
  touchOnBlur: true,
})(EditReportForm);
