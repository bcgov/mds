import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { renderConfig } from "@/components/common/config";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import * as FORM from "@/constants/forms";
import { required, validSearchSelection } from "@/utils/Validate";
import { EngineerOfRecordOptions } from "@/components/Forms/PartyRelationships/EngineerOfRecordOptions";
import { PermitteeOptions } from "@/components/Forms/PartyRelationships/PermitteeOptions";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  parties: PropTypes.arrayOf(CustomPropTypes.party).isRequired,
  partyIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  partyRelationshipType: CustomPropTypes.partyRelationshipType.isRequired,
  mine: CustomPropTypes.mine,
};

const defaultProps = {
  mine: {},
};

const validate = (values) => {
  const errors = {};
  if (values.start_date && values.end_date) {
    if (Date.parse(values.start_date) >= Date.parse(values.end_date)) {
      errors.end_date = "Must be after start date.";
    }
  }
  return errors;
};

const validParty = validSearchSelection({ key: "parties", err: "Invalid Party" });

export const AddPartyRelationshipForm = (props) => {
  let options;

  switch (props.partyRelationshipType.mine_party_appt_type_code) {
    case "EOR":
      options = <EngineerOfRecordOptions mine={props.mine} />;
      break;
    case "PMT":
      options = <PermitteeOptions mine={props.mine} />;
      break;
    default:
      options = <div />;
      break;
  }

  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row gutter={16}>
        <Col md={24} xs={24}>
          <Form.Item>
            <Field
              id="party_guid"
              name="party_guid"
              label="Name *"
              component={renderConfig.LARGE_SELECT}
              data={props.partyIds}
              options={props.parties}
              validate={[required, validParty]}
              handleChange={props.handleChange}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} xs={24}>
          <Form.Item>
            <Field
              id="start_date"
              name="start_date"
              label="Start Date"
              placeholder="yyyy-mm-dd"
              component={renderConfig.DATE}
            />
          </Form.Item>
        </Col>
        <Col md={12} xs={24}>
          <Form.Item>
            <Field
              id="end_date"
              name="end_date"
              label="End Date"
              placeholder="yyyy-mm-dd"
              component={renderConfig.DATE}
            />
          </Form.Item>
        </Col>
      </Row>
      {options}
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
        <Button className="full-mobile" type="primary" htmlType="submit">
          {props.title}
        </Button>
      </div>
    </Form>
  );
};

AddPartyRelationshipForm.propTypes = propTypes;
AddPartyRelationshipForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.ADD_PARTY_RELATIONSHIP,
  validate,
  touchOnBlur: false,
})(AddPartyRelationshipForm);
