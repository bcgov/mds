import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm } from "antd";
import { required, maxLength, number, lat, lon } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import RenderField from "@/components/common/RenderField";
import PartySelectField from "@/components/common/PartySelectField";
import RenderSelect from "@/components/common/RenderSelect";
import * as FORM from "@/constants/forms";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
};

const statusData = [
  { value: "CAM", label: "Care and Maintenance" },
  { value: "CLO", label: "Closed" },
  { value: "OPT", label: "Operating" },
];

const riskData = [
  { value: "LOW", label: "Low" },
  { value: "SIG", label: "Significant" },
  { value: "HIG", label: "High" },
  { value: "EXT", label: "Extreme" },
  { value: "NOD", label: "N/A (No Dam)" },
];

const boolData = [
  { value: false, label: "No" },
  { value: true, label: "Yes" },
];

export const AddTailingsForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row gutter={16}>
      <Col span={24}>
        <Form.Item>
          <Field
            id="mine_tailings_storage_facility_name"
            name="mine_tailings_storage_facility_name"
            label="Tailings Storage Facility Name*"
            component={RenderField}
            validate={[required]}
          />
        </Form.Item>
      </Col>
    </Row>
    <Row gutter={16}>
      <Col md={12} xs={24}>
        <Form.Item>
          <Field
            id="latitude"
            name="latitude"
            label="Latitude"
            component={RenderField}
            validate={[number, maxLength(10), lat]}
          />
        </Form.Item>
      </Col>
      <Col md={12} xs={24}>
        <Form.Item>
          <Field
            id="longitude"
            name="longitude"
            label="Longitude"
            component={RenderField}
            validate={[number, maxLength(12), lon]}
          />
        </Form.Item>
      </Col>
    </Row>
    <Row gutter={16}>
      <Col md={12} xs={24}>
        <Form.Item>
          <Field
            id="risk_classification"
            name="risk_classification"
            label="Risk Classification"
            component={RenderSelect}
            data={riskData}
          />
        </Form.Item>
      </Col>
      <Col md={12} xs={24}>
        <Form.Item>
          <Field
            id="operating_status"
            label="Operating Status"
            name="operating_status"
            component={RenderSelect}
            data={statusData}
          />
        </Form.Item>
      </Col>
    </Row>
    {/* <Row gutter={16}>
      <Col md={12} xs={24}>
        <Form.Item>
          <PartySelectField
            id="eor_party_guid"
            name="eor_party_guid"
            label="Engineer of Record"
            partyLabel="EOR"
            // validate={[required]}
            allowAddingParties
          />
        </Form.Item>
      </Col>
      <Col md={12} xs={24}>
        <Form.Item>
          <PartySelectField
            id="tsf_qualified_person_party_guid"
            name="tsf_qualified_person_party_guid"
            label="TSF Qualified Person"
            partyLabel="TSF Qualified Person"
            // validate={[required]}
            allowAddingParties
          />
        </Form.Item>
      </Col>
    </Row> */}
    <Row gutter={16}>
      <Col md={12} xs={24}>
        <Form.Item>
          <Field
            id="has_itrb"
            name="has_itrb"
            label="Independent Tailings Review Board"
            component={RenderSelect}
            data={boolData}
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
        disabled={props.submitting}
      >
        <Button className="full-mobile" type="secondary" disabled={props.submitting}>
          Cancel
        </Button>
      </Popconfirm>
      <Button className="full-mobile" type="primary" htmlType="submit" loading={props.submitting}>
        {props.title}
      </Button>
    </div>
  </Form>
);

AddTailingsForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.ADD_TAILINGS,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.ADD_TAILINGS),
})(AddTailingsForm);
