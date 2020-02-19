import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import { required } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  // TODO: Create a custom prop-type for document templates.
  template: PropTypes.objectOf(PropTypes.any).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
};

const createFields = (fields) => (
  <div>
    {fields &&
      fields.length > 0 &&
      fields.map((field) => (
        <Row key={field.id}>
          <Col>
            <Form.Item>
              <Field
                id={field.id}
                name={field.id}
                label={field.label}
                placeholder={field.placeholder}
                component={renderConfig[field.type]}
                validate={field.required ? [required] : null}
              />
            </Form.Item>
          </Col>
        </Row>
      ))}
  </div>
);

export const GenerateDocumentForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row gutter={16}>
      <Col>{createFields(props.template.fields)}</Col>
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
        Generate {props.template.name}
      </Button>
    </div>
  </Form>
);

GenerateDocumentForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.GENERATE_DOCUMENT,
  // TODO: Handle form initial values.
  // initialValues: {},
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.GENERATE_DOCUMENT),
})(GenerateDocumentForm);
