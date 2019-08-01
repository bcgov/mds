import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import RenderSelect from "@/components/common/RenderSelect";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import * as FORM from "@/constants/forms";
import { resetForm } from "@/utils/helpers";
import { getDropdownApplicationStatusOptions } from "@/selectors/staticContentSelectors";
import { required, maxLength } from "@/utils/Validate";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  applicationStatusOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
};

export const EditApplicationForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row gutter={16}>
      <Col>
        <Form.Item>
          <Field
            id="application_status_code"
            name="application_status_code"
            label="Application status*"
            placeholder="Select an application status"
            component={RenderSelect}
            data={props.applicationStatusOptions}
            validate={[required]}
          />
        </Form.Item>
        <Form.Item>
          <Field
            id="description"
            name="description"
            label="Description"
            component={RenderAutoSizeField}
            validate={[maxLength(280)]}
          />
        </Form.Item>
      </Col>
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
        {props.title}
      </Button>
    </div>
  </Form>
);

EditApplicationForm.propTypes = propTypes;

export default compose(
  connect((state) => ({
    applicationStatusOptions: getDropdownApplicationStatusOptions(state),
  })),
  reduxForm({
    form: FORM.EDIT_APPLICATION,
    touchOnBlur: false,
    onSubmitSuccess: resetForm(FORM.EDIT_APPLICATION),
  })
)(EditApplicationForm);
