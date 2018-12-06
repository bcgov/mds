import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { renderConfig } from "@/components/common/config";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import * as FORM from "@/constants/forms";
import { required } from "@/utils/Validate";
import { resetForm } from "@/utils/helpers";
import EOROptions from "@/components/Forms/PartyRelationships/EOROptions";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  parties: PropTypes.object.isRequired,
  partyIds: PropTypes.array.isRequired,
  partyType: PropTypes.string,
  mine: PropTypes.object.isRequired,
};

const defaultProps = {
  partyType: "",
  mine: {},
};

export const AddPartyRelationshipForm = (props) => {
  let options;
  switch (props.partyType) {
    case "EOR":
      options = <EOROptions mine={props.mine} />;
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
              id="name"
              name="name"
              label="Name *"
              component={renderConfig.LARGE_SELECT}
              data={props.partyIds}
              options={props.parties}
              validate={[required]}
              handleChange={props.handleChange}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} xs={24}>
          <Form.Item>
            <Field
              id="startDate"
              name="startDate"
              label="Start Date"
              placeholder="yyyy-mm-dd"
              component={renderConfig.DATE}
            />
          </Form.Item>
        </Col>
        <Col md={12} xs={24}>
          <Form.Item>
            <Field
              id="endDate"
              name="endDate"
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
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.ADD_PARTY_RELATIONSHIP),
})(AddPartyRelationshipForm);
