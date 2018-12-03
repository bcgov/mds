import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { renderConfig } from "@/components/common/config";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import * as FORM from "@/constants/forms";
import { required } from "@/utils/Validate";
import { resetForm } from "@/utils/helpers";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  parties: PropTypes.object.isRequired,
  partyIds: PropTypes.array.isRequired,
};

const defaultProps = {
  parties: {},
  partyIds: [],
};

export const AddPartyRelationshipForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row gutter={16}>
      <Col md={12} xs={24}>
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
      <Col md={12} xs={24}>
        <Form.Item>
          <Field
            id="date"
            name="date"
            label="Effective Date *"
            placeholder="yyyy-mm-dd"
            component={renderConfig.DATE}
            validate={[required]}
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
      <Button className="full-mobile" type="primary" htmlType="submit">
        {props.title}
      </Button>
    </div>
  </Form>

  /*   <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row gutter={16}>
      <Col>
        {           <Form.Item>
            <Field
              id="tsf_name"
              name="tsf_name"
              label='TSF Name*'
              component={RenderField}
              validate={[required]}
            />
          </Form.Item> }
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
      <Button className="full-mobile" type="primary" htmlType="submit">
        {props.title}
      </Button>
    </div>
  </Form> */
);

AddPartyRelationshipForm.propTypes = propTypes;
AddPartyRelationshipForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.ADD_PARTY_RELATIONSHIP,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.ADD_PARTY_RELATIONSHIP),
})(AddPartyRelationshipForm);
