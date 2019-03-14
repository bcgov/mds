import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row, Popconfirm } from "antd";

import RenderDate from "@/components/common/RenderDate";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderField from "@/components/common/RenderField";
import RenderSelect from "@/components/common/RenderSelect";
import { getDropdownApplicationStatusOptions } from "@/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import { required, maxLength, dateNotInFuture } from "@/utils/Validate";
import { resetForm } from "@/utils/helpers";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  applicationStatusOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
};

export const AddApplicationForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row gutter={16}>
      <Col>
        <Form.Item>
          <Field
            id="application_no"
            name="application_no"
            label="Application Number"
            component={RenderField}
            validate={[required]}
          />
        </Form.Item>
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
            id="received_date"
            name="received_date"
            label="Received date"
            component={RenderDate}
            validate={[required, dateNotInFuture]}
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
    <br />
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

AddApplicationForm.propTypes = propTypes;
export default compose(
  connect((state) => ({
    applicationStatusOptions: getDropdownApplicationStatusOptions(state),
  })),
  reduxForm({
    form: FORM.ADD_APPLICATION,
    touchOnBlur: true,
    onSubmitSuccess: resetForm(FORM.ADD_APPLICATION),
  })
)(AddApplicationForm);
