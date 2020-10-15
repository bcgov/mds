import React from "react";
import { reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Col, Row } from "antd";
import { resetForm } from "@common/utils/helpers";
import { required } from "@common/utils/Validate";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import { PROFILE_NOCIRCLE } from "@/constants/assets";
import PartySelectField from "@/components/common/PartySelectField";

const propTypes = {
  originalNoticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
};

export const NOWContactForm = (props) => (
  <Form layout="vertical">
    <Row gutter={16}>
      {props.originalNoticeOfWork.contacts.map((contact) => (
        <Col span={12}>
          <div className="inline-flex">
            <img
              className="icon-sm padding-small--right"
              src={PROFILE_NOCIRCLE}
              alt="user"
              height={25}
              style={{ width: "initial" }}
            />
            <p className="field-title">{`NoW ${contact.mine_party_appt_type_code_description} Contact Information`}</p>
            <p>{contact.party.name}</p>
          </div>
          <Form.Item>
            <PartySelectField
              id={contact.party.party_guid}
              name={contact.party.party_guid}
              label={contact.mine_party_appt_type_code_description}
              partyLabel={contact.mine_party_appt_type_code_description}
              validate={[required]}
              allowAddingParties
            />
          </Form.Item>
          <br />
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
