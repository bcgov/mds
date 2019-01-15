import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import RenderField from "@/components/common/RenderField";
import RenderDate from "@/components/common/RenderDate";
import RenderSelect from "@/components/common/RenderSelect";
import UploadedFilesList from "@/components/common/UploadedFilesList";
import FileUpload from "@/components/common/FileUpload";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import * as FORM from "@/constants/forms";
import { UPLOAD_MINE_EXPECTED_DOCUMENT_FILE } from "@/constants/API";
import { required } from "@/utils/Validate";
import { resetForm } from "@/utils/helpers";
import { DOCUMENT, EXCEL } from "@/constants/fileTypes";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  statusOptions: PropTypes.array.isRequired,
  selectedDocument: CustomPropTypes.mineExpectedDocument,
};

export const EditTailingsReportForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row gutter={16}>
      <Col>
        <Form.Item>
          <Field
            id="tsf_report_name"
            name="tsf_report_name"
            label="Report Name"
            component={RenderField}
            validate={[required]}
          />
        </Form.Item>
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
        <Form.Item label="Upload Documents">
          <Field
            id="tsf_document_upload"
            name="tsf_document_upload"
            uploadUrl={UPLOAD_MINE_EXPECTED_DOCUMENT_FILE(props.selectedDocument.exp_document_guid)}
            acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL }}
            component={FileUpload}
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
      <Button className="full-mobile" type="primary" htmlType="submit">
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
