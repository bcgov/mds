import React from "react";
import PropTypes from "prop-types";
import { reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Col, Row } from "antd";
import { resetForm } from "@common/utils/helpers";
import { required } from "@common/utils/Validate";
import * as FORM from "@/constants/forms";
import { PROFILE_NOCIRCLE } from "@/constants/assets";
import PartySelectField from "@/components/common/PartySelectField";

const propTypes = {
  contacts: PropTypes.objectOf(PropTypes.any).isRequired,
};

export const NOWContactForm = (props) => (
  <Form layout="vertical">
    <Row gutter={16}>
      {props.contacts.map((contact) => (
        <Col span={12}>
          <div className="inline-flex padding-small">
            <p className="field-title">
              <img
                className="icon-sm padding-small--right padding-small--bottom"
                src={PROFILE_NOCIRCLE}
                alt="user"
                height={25}
              />
              NoW Contact Information
            </p>
            <p>{contact.party.name}</p>
          </div>
          <Form.Item>
            <PartySelectField
              id="party_guid"
              name="party_guid"
              label={contact.mine_party_appt_type_code_description}
              partyLabel={contact.mine_party_appt_type_code_description}
              validate={[required]}
              allowAddingParties
            />
          </Form.Item>
        </Col>
      ))}
    </Row>
  </Form>
);

NOWContactForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.NOW_CONTACT_FORM,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.NOW_CONTACT_FORM),
})(NOWContactForm);
