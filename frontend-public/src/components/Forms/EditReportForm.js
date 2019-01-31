import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { Field, reduxForm } from "redux-form";
import moment from "moment";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import UploadedFilesList from "@/components/common/UploadedFilesList";
import MineFilePicker from "@/components/dashboard/mineInfo/MineFilePicker";
import * as FORM from "@/constants/forms";
import { resetForm } from "@/utils/helpers";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  selectedDocument: CustomPropTypes.mineExpectedDocument.isRequired,
};

export const EditReportForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row gutter={16}>
      <Col>
        <Form.Item label="Attached Files">
          <div>
            <p>
              Note: you will be able to remove files up until the March 31, {moment().year()}{" "}
              deadline. After that date, all attached files will be considered official submissions
              to the Ministry.
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
        <Form.Item label="Upload/Attach Documents">
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
      <Popconfirm
        placement="topRight"
        title="Are you sure?"
        onConfirm={props.closeModal}
        okText="Yes"
        cancelText="No"
      >
        <Button type="secondary" className="modal-cancel-btn">
          Cancel
        </Button>
      </Popconfirm>
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
