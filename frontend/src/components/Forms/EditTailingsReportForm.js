import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import CustomPropTypes from "@/customPropTypes";
import RenderDate from "@/components/common/RenderDate";
import RenderSelect from "@/components/common/RenderSelect";
import UploadedFilesList from "@/components/common/UploadedFilesList";
import MineTailingsFilePicker from "@/components/mine/Tailings/MineTailingsFilePicker";
import * as FORM from "@/constants/forms";
import { required } from "@/utils/Validate";
import { resetForm } from "@/utils/helpers";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  statusOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  selectedDocument: CustomPropTypes.mineExpectedDocument.isRequired,
  submitting: PropTypes.bool.isRequired,
};

export const EditTailingsReportForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row gutter={16}>
      <Col>
        <Form.Item>
          <Field
            id="tsf_report_due_date"
            name="tsf_report_due_date"
            label="Due Date"
            component={RenderDate}
            validate={[required]}
          />
        </Form.Item>
        <Form.Item>
          <Field
            id="tsf_report_received_date"
            name="tsf_report_received_date"
            label="Received Date"
            component={RenderDate}
          />
        </Form.Item>
        <Form.Item>
          <Field
            id="tsf_report_status"
            name="tsf_report_status"
            label="Status"
            placeholder="Select a Status"
            component={RenderSelect}
            data={props.statusOptions}
          />
        </Form.Item>
        <Form.Item label="Attached Files">
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
            component={MineTailingsFilePicker}
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
        <Button type="secondary">Cancel</Button>
      </Popconfirm>
      <Button className="full-mobile" type="primary" htmlType="submit" disabled={props.submitting}>
        {props.title}
      </Button>
    </div>
  </Form>
);

EditTailingsReportForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.EDIT_TAILINGS,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.EDIT_TAILINGS),
})(EditTailingsReportForm);
