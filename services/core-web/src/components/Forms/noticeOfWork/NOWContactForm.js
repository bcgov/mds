/* eslint-disable */
import React from "react";
import { reduxForm, FieldArray, Field } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { PlusOutlined } from "@ant-design/icons";
import { Col, Row, Button } from "antd";
import { startCase } from "lodash";
import { resetForm } from "@common/utils/helpers";
import { required } from "@common/utils/Validate";
import * as Styles from "@/constants/styles";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import { TRASHCAN } from "@/constants/assets";
import { PROFILE_NOCIRCLE } from "@/constants/assets";

import PartySelectField from "@/components/common/PartySelectField";
import RenderSelect from "@/components/common/RenderSelect";

const propTypes = {
  initialValues: CustomPropTypes.importedNOWApplication.isRequired,
};

const renderContacts = ({ fields, contacts, partyRelationshipTypes }) => {
  const filteredRelationships = partyRelationshipTypes.filter((pr) =>
    ["MMG", "PMT", "THD", "LDO", "AGT", "EMM", "STO"].includes(pr.value)
  );
  return (
    <>
      <Row gutter={24}>
        {fields.map((contact, index) => (
          <Col lg={12} sm={24} key={index}>
            <div className="grey-background">
              <div className="inline-flex">
                <img
                  className="icon-sm padding-small--right"
                  src={PROFILE_NOCIRCLE}
                  alt="user"
                  height={25}
                  style={{ width: "initial" }}
                />
                <p className="field-title">{`NoW ${
                  contacts[index] ? contacts[index].mine_party_appt_type_code_description : ""
                } Contact Information:`}</p>
                <p>{contacts[index] ? startCase(contacts[index].party.name) : "New Contact"}</p>
                <Button
                  ghost
                  onClick={() => fields.remove(index)}
                  className="position-right"
                  style={{ margin: "0 30px 20px 0" }}
                >
                  <img name="remove" src={TRASHCAN} alt="Remove MineType" />
                </Button>
              </div>
              <Form.Item label="Role">
                <Field
                  id={`${contact}.mine_party_appt_type_code`}
                  name={`${contact}.mine_party_appt_type_code`}
                  component={RenderSelect}
                  data={filteredRelationships}
                  validate={[required]}
                />
              </Form.Item>
              <Form.Item>
                <PartySelectField
                  name={`${contact}.party_guid`}
                  name={`${contact}.party_guid`}
                  label={
                    contacts[index]
                      ? `${contacts[index].mine_party_appt_type_code_description} Name`
                      : "Contact Name"
                  }
                  partyLabel={
                    contacts[index]
                      ? contacts[index].mine_party_appt_type_code_description
                      : "Contact Name"
                  }
                  validate={[required]}
                  allowAddingParties
                />
              </Form.Item>
              <br />
            </div>
          </Col>
        ))}
      </Row>
      <Row gutter={16}>
        <Button
          className="btn--dropdown"
          onClick={(event) => fields.push({ mine_party_appt_type_code: "", party_guid: "" })}
        >
          <PlusOutlined style={{ color: Styles.COLOR.violet }} />
          Add New Contact
        </Button>
      </Row>
    </>
  );
};

export const NOWContactForm = (props) => (
  <Form layout="vertical">
    <FieldArray
      id="contacts"
      name="contacts"
      component={renderContacts}
      contacts={props.contacts}
      partyRelationshipTypes={props.partyRelationshipTypesList}
    />
  </Form>
);

NOWContactForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.NOW_CONTACT_FORM,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.NOW_CONTACT_FORM),
})(NOWContactForm);
