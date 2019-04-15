import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderDateTime from "@/components/common/RenderDateTime";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import { required, dateNotInFuture } from "@/utils/Validate";
import { resetForm } from "@/utils/helpers";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  followupActionOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
};

export const AddIncidentForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row gutter={16}>
      <Col>
        <Form.Item>
          <Field
            id="incident_timestamp"
            name="incident_timestamp"
            label="Incident Date and Time"
            component={RenderDateTime}
            validate={[required, dateNotInFuture]}
          />
        </Form.Item>
        <Form.Item>
          <Field
            id="incident_description"
            name="incident_description"
            label="Incident Description"
            component={RenderAutoSizeField}
            validate={[required]}
          />
        </Form.Item>
        <Form.Item>
          <Field
            id="reported_timestamp"
            name="reported_timestamp"
            label="Reported Date and Time"
            component={RenderDateTime}
            validate={[required, dateNotInFuture]}
          />
        </Form.Item>
        <Form.Item>
          <Field
            id="reported_by"
            name="reported_by"
            label="Reporter's Name"
            component={RenderField}
            validate={[required]}
          />
        </Form.Item>
        <Form.Item>
          <Field
            id="reported_by_role"
            name="reported_by_role"
            label="Job Title of Reporter"
            component={RenderField}
            validate={[required]}
          />
        </Form.Item>
        <Form.Item>
          <Field
            id="followup_type_code"
            name="followup_type_code"
            label="EMPR Action"
            component={renderConfig.SELECT}
            data={props.followupActionOptions}
            validate={[required]}
          />
        </Form.Item>
        <Form.Item>
          <Field
            id="followup_inspection_no"
            name="followup_inspection_no"
            label="NRIS Inspection Number"
            component={RenderField}
            validate={[required]}
          />
        </Form.Item>
        <Form.Item>
          <Field
            id="closing_report_summary"
            name="closing_report_summary"
            label="Closing Report Summary"
            component={RenderAutoSizeField}
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

AddIncidentForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.MINE_INCIDENT,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.MINE_INCIDENT),
})(AddIncidentForm);
