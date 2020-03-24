import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import {
  required,
  number,
  postalCode,
  maxLength,
  dateNotInFuture,
  currency,
} from "@common/utils/Validate";
import { resetForm, upperCase, currencyMask } from "@common/utils/helpers";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderDate from "@/components/common/RenderDate";
import PartySelectField from "@/components/common/PartySelectField";
import * as FORM from "@/constants/forms";
import RenderSelect from "@/components/common/RenderSelect";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  bondTypeOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
};

export const BondForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row gutter={16}>
      <Col md={12} sm={24}>
        <Form.Item>
          <Field
            id="amount"
            name="amount"
            label="Bond Amount*"
            component={RenderField}
            {...currencyMask}
            validate={[required, number, currency]}
          />
        </Form.Item>
      </Col>
      <Col md={12} sm={24}>
        <Form.Item>
          <Field
            id="bond_type_code"
            name="bond_type_code"
            label="Bond Type*"
            component={RenderSelect}
            data={props.bondTypeOptions}
            validate={[required]}
          />
        </Form.Item>
      </Col>
    </Row>
    <Row gutter={16}>
      <Col md={12} sm={24}>
        <Form.Item>
          <PartySelectField
            id="payer_party_guid"
            name="payer_party_guid"
            label="Payer*"
            partyLabel="payee"
            validate={[required]}
            allowAddingParties
          />
        </Form.Item>
      </Col>
      <Col md={12} sm={24}>
        <Form.Item>
          <Field
            id="issue_date"
            name="issue_date"
            label="Issue Date*"
            showTime
            component={RenderDate}
            validate={[required, dateNotInFuture]}
          />
        </Form.Item>
      </Col>
    </Row>
    <Row gutter={16}>
      <Col md={12} sm={24}>
        <Form.Item>
          <Field
            id="reference_number"
            name="reference_number"
            label="Reference Number"
            component={RenderField}
          />
        </Form.Item>
      </Col>
      <Col md={12} sm={24}>
        <Form.Item>
          <Field id="project_id" name="project_id" label="Project Id" component={RenderField} />
        </Form.Item>
      </Col>
    </Row>
    <Row gutter={16}>
      <Col md={12} xs={24}>
        <h5>Institution</h5>
      </Col>
    </Row>
    <Row gutter={16}>
      <Col lg={12} md={24}>
        <Form.Item>
          <Field
            id="institution_name"
            name="institution_name"
            label="Institution Name"
            component={RenderField}
          />
        </Form.Item>
      </Col>
    </Row>
    <Row gutter={16}>
      <Col md={12} xs={24}>
        <Form.Item>
          <Field
            id="institution_street"
            name="institution_street"
            label="Street Address"
            component={RenderField}
          />
        </Form.Item>
      </Col>
      <Col md={12} xs={24}>
        <Form.Item>
          <Field
            id="institution_city"
            name="institution_city"
            label="City"
            component={RenderField}
            validate={[maxLength(30)]}
          />
        </Form.Item>
      </Col>
    </Row>
    <Row gutter={16}>
      <Col md={12} xs={24}>
        <Form.Item>
          <Field
            id="institution_province"
            name="institution_province"
            label="Province"
            component={RenderSelect}
            data={props.provinceOptions}
          />
        </Form.Item>
      </Col>
      <Col md={12} xs={24}>
        <Form.Item>
          <Field
            id="institution_postal_code"
            name="institution_postal_code"
            label="Postal Code"
            placeholder="e.g xxxxxx"
            component={RenderField}
            validate={[maxLength(6), postalCode]}
            normalize={upperCase}
          />
        </Form.Item>
      </Col>
    </Row>
    <Row>
      <Col md={24}>
        <Form.Item>
          <Field id="note" name="note" label="Notes" component={RenderAutoSizeField} />
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

BondForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.ADD_BOND,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.ADD_BOND),
})(BondForm);
