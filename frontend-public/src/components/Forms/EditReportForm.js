import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row } from "antd";
import CustomPropTypes from "@/customPropTypes";
import UploadedFilesList from "@/components/common/UploadedFilesList";
import MineFilePicker from "@/components/dashboard/mine/reports/MineFilePicker";
import * as FORM from "@/constants/forms";
import { resetForm } from "@/utils/helpers";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  selectedDocument: CustomPropTypes.mineExpectedDocument.isRequired,
};

export const EditReportForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row gutter={16}>
      <Col>
        <Form.Item label="Attached Files">
          <div>
            <p>
              Note: You will be able to remove files up until the end of the reports due date. After
              that date, all attached files will be considered official submissions to the Ministry.
            </p>
          </div>
          <Field
            id="tsf_report_file_uploads"
            name="tsf_report_file_uploads"
            component={UploadedFilesList}
            selectedDocId={props.selectedDocument.exp_document_guid}
            mineId={props.selectedDocument.mine_guid}
          />
        </Form.Item>
        <Form.Item label="Upload/Link Documents">
          <Field
            id="tsfDocumentPicker"
            name="tsfDocumentPicker"
            selectedDocument={props.selectedDocument}
            component={MineFilePicker}
          />
        </Form.Item>
      </Col>
    </Row>
    <div className="right center-mobile">
      <Button className="full-mobile" type="primary" htmlType="submit">
        Submit
      </Button>
    </div>
  </Form>
);

EditReportForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.EDIT_TAILINGS,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.EDIT_TAILINGS),
})(EditReportForm);
