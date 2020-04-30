import React from "react";
import PropTypes from "prop-types";
import { reduxForm, focus } from "redux-form";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { getGenerateDocumentFormField } from "@/components/common/GenerateDocumentFormField";

const propTypes = {
  documentType: PropTypes.objectOf(PropTypes.any).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
};

const createFields = (fields) => (
  <div>
    {fields &&
      fields.length > 0 &&
      fields
        .filter((field) => !field["read-only"])
        .map((field) => (
          <Row key={field.id}>
            <Col>
              <Form.Item>{getGenerateDocumentFormField(field)}</Form.Item>
            </Col>
          </Row>
        ))}
  </div>
);

export const GenerateDocumentForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row gutter={16}>
      <Col>{createFields(props.documentType.document_template.form_spec)}</Col>
    </Row>
    <div className="right center-mobile">
      <Popconfirm
        placement="topRight"
        title="Are you sure you want to cancel?"
        onConfirm={props.closeModal}
        okText="Yes"
        cancelText="No"
      >
        <Button className="full-mobile" type="secondary">
          Cancel
        </Button>
      </Popconfirm>
      <Button className="full-mobile" type="primary" htmlType="submit" disabled={props.submitting}>
        Generate {props.documentType.description}
      </Button>
    </div>
  </Form>
);

GenerateDocumentForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.GENERATE_DOCUMENT,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.GENERATE_DOCUMENT),
  onSubmitFail: (errors, dispatch) =>
    dispatch(focus(FORM.GENERATE_DOCUMENT, Object.keys(errors)[0])),
})(GenerateDocumentForm);
