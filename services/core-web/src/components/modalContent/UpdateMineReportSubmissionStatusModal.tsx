import React, { FC } from "react";
import { Field, getFormValues } from "redux-form";

import { MINE_REPORT_SUBMISSION_CODES, MINE_REPORT_STATUS_HASH } from "@mds/common";

import { Button, Col, Row, Alert } from "antd";

import * as FORM from "@/constants/forms";
import { maxLength, required } from "@mds/common/redux/utils/Validate";

import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { useSelector } from "react-redux";
// import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import RenderSelect from "@mds/common/components/forms/RenderSelect";

interface UpdateMineReportSubmissionStatusModalProps {
  currentStatus: string;
  mineReportStatusOptions: any;
  handleSubmit: (values) => void;
  closeModal: () => void;
}

const UpdateMineReportSubmissionStatusModal: FC<UpdateMineReportSubmissionStatusModalProps> = ({
  currentStatus,
  mineReportStatusOptions,
  handleSubmit,
  closeModal,
}) => {
  const MINE_REPORT_STATUS_DESCRIPTION_HASH = {
    [MINE_REPORT_SUBMISSION_CODES.ACC]:
      "Report submission meets requirement and is ready for review",
    [MINE_REPORT_SUBMISSION_CODES.REQ]:
      "Requesting more information from proponents through MineSpace. This will allow proponents to edit previously submitted information or files",
    [MINE_REPORT_SUBMISSION_CODES.INI]:
      "Proponent has submitted a new report through Minespace. No changes could be made at this stage",
  };

  const formValues =
    useSelector((state) => getFormValues(FORM.UPDATE_MINE_REPORT_SUBMISSION_STATUS)(state)) ?? {};

  return (
    <FormWrapper name={FORM.UPDATE_MINE_REPORT_SUBMISSION_STATUS} onSubmit={handleSubmit}>
      <Row gutter={48}>
        <Col span={24}>
          <div className="margin-medium--bottom">
            <b>Current status</b>
          </div>
          <div className="margin-large--bottom">{currentStatus}</div>
          <div className="margin-large--bottom">
            <b>Change status to</b>
          </div>
          {formValues?.mine_report_submission_status_code && (
            <Alert
              message={
                <Row justify="space-between" align="middle" className="alert-container">
                  <span>
                    {MINE_REPORT_STATUS_HASH[formValues?.mine_report_submission_status_code]}
                  </span>
                </Row>
              }
              type={"warning"}
              showIcon
              description={
                MINE_REPORT_STATUS_DESCRIPTION_HASH[formValues?.mine_report_submission_status_code]
              }
            />
          )}
          <Row className="margin-medium--top">
            <Col span={12}>
              <Field
                id="mine_report_submission_status_code"
                name="mine_report_submission_status_code"
                component={RenderSelect}
                data={mineReportStatusOptions.filter((item) =>
                  [
                    MINE_REPORT_SUBMISSION_CODES.ACC,
                    MINE_REPORT_SUBMISSION_CODES.REQ,
                    MINE_REPORT_SUBMISSION_CODES.INI,
                  ].includes(item.value)
                )}
                required
                validate={[required]}
              />
            </Col>
          </Row>
          {/* <Field
            id="description_comment"
            name="description_comment"
            label="Additional Comment"
            required
            help="Additional comments will be sent to the report submitter and mine manager"
            component={RenderAutoSizeField}
            validate={[required, maxLength(1000)]}
            props={{ maximumCharacters: 1000, rows: 3 }}
          /> */}
        </Col>
      </Row>
      <div className="right center-mobile" style={{ paddingTop: "14px" }}>
        <Button className="full-mobile" onClick={closeModal}>
          Cancel
        </Button>
        <Button type="primary" className="full-mobile" htmlType="submit">
          Update
        </Button>
      </div>
    </FormWrapper>
  );
};

export default UpdateMineReportSubmissionStatusModal;
