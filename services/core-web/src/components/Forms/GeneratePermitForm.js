import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import { required } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  cancelGeneration: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  isAmendment: PropTypes.bool.isRequired,
};

export const GeneratePermitForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <h2 className="padding-large--top">Part One: General Information</h2>
    <Row gutter={32}>
      <Col xs={24} md={12}>
        <Field
          id="mine_no"
          name="mine_no"
          label="Mine Number"
          required
          component={renderConfig.FIELD}
          validate={[required]}
          disabled
        />
      </Col>
      <Col xs={24} md={12}>
        <Field
          id="permit_number"
          name="permit_number"
          label="Permit Number"
          required
          component={renderConfig.FIELD}
          validate={[required]}
        />
      </Col>
    </Row>
    <Row gutter={32}>
      <Col xs={24} md={12}>
        <Field
          id="permittee"
          name="permittee"
          label="Permitee"
          required
          component={renderConfig.FIELD}
          validate={[required]}
          disabled
        />
      </Col>
      <Col xs={24} md={12}>
        <Field
          id="permittee_mailing_address"
          name="permittee_mailing_address"
          label="Permitee Mailing address"
          required
          component={renderConfig.AUTO_SIZE_FIELD}
          validate={[required]}
          disabled
        />
      </Col>
    </Row>
    <Row gutter={32}>
      <Col xs={24} md={12}>
        <Field
          id="property"
          name="property"
          label="Property Name"
          required
          component={renderConfig.FIELD}
          validate={[required]}
          disabled
        />
      </Col>
      <Col xs={24} md={12}>
        <Field
          id="mine_location"
          name="mine_location"
          label="Mine Location"
          required
          component={renderConfig.FIELD}
          validate={[required]}
          disabled
        />
      </Col>
    </Row>
    <Row gutter={32}>
      <Col xs={24} md={12}>
        <Field
          id="issue_date"
          name="issue_date"
          label="Issue Date"
          required
          component={renderConfig.DATE}
          validate={[required]}
          disabled
        />
      </Col>
      <Col xs={24} md={12}>
        <Field
          id="auth_end_date"
          name="auth_end_date"
          label="Authorization End Date"
          required
          component={renderConfig.DATE}
          validate={[required]}
        />
      </Col>
    </Row>
    <Row gutter={32}>
      <Col xs={24} md={12}>
        <Field
          id="lead_inspector"
          name="lead_inspector"
          label="Lead Inspector Name"
          required
          component={renderConfig.FIELD}
          validate={[required]}
          disabled
        />
      </Col>
      <Col xs={24} md={12}>
        <Field
          id="lead_inspector_title"
          name="lead_inspector_title"
          label="Lead Inspector Title"
          required
          component={renderConfig.FIELD}
          validate={[required]}
        />
      </Col>
    </Row>
    <Row gutter={32}>
      <Col xs={24} md={12}>
        <Field
          id="regional_office"
          name="regional_office"
          label="Regional Office"
          required
          component={renderConfig.FIELD}
          validate={[required]}
        />
      </Col>
      {props.isAmendment && (
        <Col xs={24} md={12}>
          <Field
            id="original_permit_issue_date"
            name="original_permit_issue_date"
            label="Original Permit Issue Date"
            required
            component={renderConfig.DATE}
            validate={[required]}
          />
        </Col>
      )}
    </Row>

    <h2 className="padding-large--top">Part Two: Preamble</h2>
    <Row gutter={32}>
      <Col xs={24} md={12}>
        <Field
          id="application_date"
          name="application_date"
          label="Application Date"
          required
          component={renderConfig.FIELD}
          validate={[required]}
          disabled
        />
      </Col>
      <Col xs={24} md={12}>
        <Field
          id="application_type"
          name="application_type"
          label="Application Type"
          required
          component={renderConfig.FIELD}
          validate={[required]}
          disabled
        />
      </Col>
    </Row>

    <h2 className="padding-large--top">Part Three: Permit Conditions</h2>
    <Row gutter={32}>
      <Col xs={24} md={12}>
        <Field
          id="conditions"
          name="conditions"
          label="Conditions"
          required
          component={renderConfig.AUTO_SIZE_FIELD}
          validate={[required]}
        />
      </Col>
    </Row>

    <div className="right center-mobile">
      <Popconfirm
        placement="topRight"
        onConfirm={() => props.cancelGeneration()}
        title="Are you sure you want to cancel?"
        okText="Yes"
        cancelText="No"
      >
        <Button className="full-mobile" type="secondary">
          Cancel
        </Button>
      </Popconfirm>
      <Button className="full-mobile" type="primary" htmlType="submit" disabled={props.submitting}>
        Generate
      </Button>
    </div>
  </Form>
);

GeneratePermitForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.GENERATE_PERMIT,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.GENERATE_PERMIT),
})(GeneratePermitForm);
