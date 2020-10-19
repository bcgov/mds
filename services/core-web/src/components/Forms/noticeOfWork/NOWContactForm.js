/* eslint-disable */
import React from "react";
import { FieldArray, Field } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { PlusOutlined } from "@ant-design/icons";
import { Col, Row, Button, Card } from "antd";
import { startCase } from "lodash";
import { required } from "@common/utils/Validate";
import * as Styles from "@/constants/styles";
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
    ["MMG", "PMT", "THD", "LDO", "AGT", "EMM", "STO", "MOR"].includes(pr.value)
  );
  return (
    <>
      <Row gutter={24}>
        {fields.map((field, index) => (
          <Col lg={12} sm={24} key={index}>
            <Card
              title={
                <div className="inline-flex padding-md--top">
                  <img
                    className="icon-sm padding-md--right"
                    src={PROFILE_NOCIRCLE}
                    alt="user"
                    height={25}
                  />
                  <p className="field-title">{`NoW ${
                    contacts[index] ? contacts[index].mine_party_appt_type_code_description : ""
                  } Contact Information:`}</p>
                  <p>{contacts[index] ? startCase(contacts[index].party.name) : "New Contact"}</p>
                  <Button
                    ghost
                    onClick={() => fields.remove(index)}
                    className="position-right no-margin"
                  >
                    <img name="remove" src={TRASHCAN} alt="Remove MineType" />
                  </Button>
                </div>
              }
              bordered={false}
            >
              <Form.Item label="Role">
                <Field
                  id={`${field}.mine_party_appt_type_code`}
                  name={`${field}.mine_party_appt_type_code`}
                  component={RenderSelect}
                  data={filteredRelationships}
                  validate={[required]}
                />
              </Form.Item>
              <Form.Item>
                <PartySelectField
                  id={`${field}.party_guid`}
                  name={`${field}.party_guid`}
                  initialValue={
                    contacts[index]
                      ? {
                          label: contacts[index].party.name,
                          value: contacts[index].party_guid,
                        }
                      : undefined
                  }
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
                  initialValues={
                    contacts[index]
                      ? {
                          ...contacts[index].party,
                          ...(contacts[index].party.address.length > 0
                            ? contacts[index].party.address[0]
                            : {}),
                        }
                      : {}
                  }
                  initialSearch={contacts[index] ? contacts[index].party.name : undefined}
                />
              </Form.Item>
              <br />
            </Card>
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

export const NOWContactForm = (props) => {
  return (
    <FieldArray
      id="contacts"
      name="contacts"
      component={renderContacts}
      contacts={props.contacts}
      partyRelationshipTypes={props.partyRelationshipTypesList}
    />
  );
};

NOWContactForm.propTypes = propTypes;

export default NOWContactForm;
