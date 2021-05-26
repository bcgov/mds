import React, { useState } from "react";
import PropTypes from "prop-types";
import { reduxForm, Field } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm, Alert } from "antd";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { getGenerateDocumentFormField } from "@/components/common/GenerateDocumentFormField";
import RenderSelect from "@/components/common/RenderSelect";

const propTypes = {
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  documentType: PropTypes.objectOf(PropTypes.any).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  additionalTitle: PropTypes.string,
  disabled: PropTypes.bool,
  allowDocx: PropTypes.bool,
};

const defaultProps = {
  additionalTitle: "",
  disabled: false,
  allowDocx: false,
};

const fileTypes = [
  {
    label: ".PDF",
    value: "PDF",
  },
  {
    label: ".DOCX",
    value: "DOCX",
  },
];

const createFields = (fields) => (
  <div>
    {fields &&
      fields.length > 0 &&
      fields
        .filter((field) => !field["read-only"])
        .map((field) => (
          <Row key={field.id}>
            <Col span={24}>
              <Form.Item>{getGenerateDocumentFormField(field)}</Form.Item>
            </Col>
          </Row>
        ))}
  </div>
);

export const GenerateDocumentForm = (props) => {
  const [fileType, setFileType] = useState("PDF");

  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      {props.allowDocx && (
        <div>
          <Row key="fileType">
            <Col span={24}>
              <>
                <Form.Item>
                  <Field
                    id="file_type"
                    name="file_type"
                    label="Select the file type for this document"
                    data={fileTypes}
                    component={RenderSelect}
                    onChange={(value) => setFileType(value)}
                  />
                </Form.Item>
                {fileType === "DOCX" && (
                  <>
                    <Alert
                      description="If you plan to edit this document, please ensure that you do not change any vital information that would contradict BC government legislation pertaining to privacy or financial information."
                      type="warning"
                      showIcon
                    />
                    <br />
                  </>
                )}
              </>
            </Col>
          </Row>
        </div>
      )}
      <Row gutter={16}>
        <Col span={24}>{createFields(props.documentType.document_template.form_spec)}</Col>
      </Row>
      <div className="right center-mobile">
        <Popconfirm
          placement="topRight"
          title="Are you sure you want to cancel?"
          onConfirm={props.closeModal}
          okText="Yes"
          cancelText="No"
          disabled={props.submitting}
        >
          <Button className="full-mobile" type="secondary" disabled={props.submitting}>
            Cancel
          </Button>
        </Popconfirm>
        <Button
          className="full-mobile"
          type="primary"
          htmlType="submit"
          loading={props.submitting}
          disabled={props.disabled}
        >
          Generate {props.documentType.description} {props.additionalTitle}
        </Button>
      </div>
    </Form>
  );
};

GenerateDocumentForm.propTypes = propTypes;
GenerateDocumentForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.GENERATE_DOCUMENT,
  touchOnBlur: true,
  onSubmitSuccess: resetForm(FORM.GENERATE_DOCUMENT),
})(GenerateDocumentForm);
