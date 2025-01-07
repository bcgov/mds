import React, { Component } from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import * as FORM from "@/constants/forms";
import { ReportSubmissions } from "@/components/Forms/reports/ReportSubmissions";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  mineReport: CustomPropTypes.mineReport.isRequired,
  onSubmit: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
};

export class EditReportForm extends Component {
  formName = FORM.EDIT_REPORT;
  state = {
    mineReportSubmissions: this.props.mineReport.mine_report_submissions,
  };

  updateMineReportSubmissions = (updatedSubmissions) => {
    this.setState({ mineReportSubmissions: updatedSubmissions }, () =>
      this.props.change(
        FORM.EDIT_REPORT,
        "mine_report_submissions",
        this.state.mineReportSubmissions
      )
    );
  };

  render() {
    return (
      <FormWrapper
        name={FORM.EDIT_REPORT}
        isModal
        onSubmit={this.props.onSubmit}
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
          <RenderCancelButton />
          <RenderSubmitButton buttonText="Add Documents" />
        </div>
      </FormWrapper>
    );
  }
}

EditReportForm.propTypes = propTypes;

export default EditReportForm;
