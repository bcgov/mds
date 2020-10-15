import React from "react";
import { reduxForm, FieldArray } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Col, Row } from "antd";
import { startCase } from "lodash";
import { resetForm } from "@common/utils/helpers";
import { required } from "@common/utils/Validate";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import { PROFILE_NOCIRCLE } from "@/constants/assets";

import PartySelectField from "@/components/common/PartySelectField";

const propTypes = {
  initialValues: CustomPropTypes.importedNOWApplication.isRequired,
};

const renderContacts = ({ fields, contacts }) => {
  return fields.map((contact, index) => {
    return (
      <Col span={12}>
        <div className="inline-flex">
          <img
            className="icon-sm padding-small--right"
            src={PROFILE_NOCIRCLE}
            alt="user"
            height={25}
            style={{ width: "initial" }}
          />
          <p className="field-title">{`NoW ${contacts[index].mine_party_appt_type_code_description} Contact Information`}</p>
          <p>{startCase(contacts[index].party.name)}</p>
        </div>

        <Form.Item>
          <PartySelectField
            id={`${contact}.party.party_guid`}
            name={`${contact}.party.party_guid`}
            label={contacts[index].mine_party_appt_type_code_description}
            partyLabel={contacts[index].mine_party_appt_type_code_description}
            validate={[required]}
            allowAddingParties
          />
        </Form.Item>
        <br />
      </Col>
    );
  });
};

export const NOWContactForm = (props) => (
  <Form layout="vertical">
    <Row gutter={16}>
      <FieldArray
        id="contacts"
        name="contacts"
        component={renderContacts}
        contacts={props.initialValues.contacts}
      />
    </Row>
  </Form>
);

NOWContactForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.NOW_CONTACT_FORM,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.NOW_CONTACT_FORM),
})(NOWContactForm);
