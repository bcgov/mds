/* eslint-disable */
import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { FieldArray, Field, arrayPush, arrayRemove } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import PropTypes from "prop-types";
import { Col, Row, Button, Card, Popconfirm } from "antd";
import { startCase } from "lodash";
import { required } from "@common/utils/Validate";
import { PlusOutlined } from "@ant-design/icons";
import CustomPropTypes from "@/customPropTypes";
import { TRASHCAN, PROFILE_NOCIRCLE } from "@/constants/assets";

import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import * as FORM from "@/constants/forms";

import PartySelectField from "@/components/common/PartySelectField";
import RenderSelect from "@/components/common/RenderSelect";

const propTypes = {
  initialValues: CustomPropTypes.importedNOWApplication.isRequired,
  isEditView: PropTypes.bool,
  arrayRemove: PropTypes.func.isRequired,
  arrayPush: PropTypes.func.isRequired,
};

const defaultProps = {
  isEditView: false,
};

const renderContacts = ({
  fields,
  contacts,
  partyRelationshipTypes,
  isEditView,
  arrayPushReduxForms,
  arrayRemoveReduxForms,
}) => {
  const filteredRelationships = partyRelationshipTypes.filter((pr) =>
    ["MMG", "PMT", "THD", "LDO", "AGT", "EMM", "MOR"].includes(pr.value)
  );

  return (
    <>
      <Row gutter={24}>
        {fields
          .map((field, index) => (
            <Col lg={12} sm={24} key={index}>
              <Card
                style={{ height: "300px" }}
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
                    {contacts[index] && contacts[index].now_party_appointment_id ? (
                      <Popconfirm
                        className="position-right no-margin"
                        placement="topLeft"
                        title={`Are you sure you want to remove ${startCase(
                          contacts[index].party.name
                        )} as a contact on this Notice of Work?`}
                        onConfirm={() => {
                          const updatedContact = contacts[index];
                          updatedContact.state_modified = "delete";

                          arrayRemoveReduxForms(FORM.EDIT_NOTICE_OF_WORK, "contacts", index);
                          arrayPushReduxForms(FORM.EDIT_NOTICE_OF_WORK, "contacts", updatedContact);
                        }}
                        okText="Delete"
                        cancelText="Cancel"
                      >
                        <Button className="full-mobile" ghost type="primary">
                          <img name="remove" src={TRASHCAN} alt="Remove User" />
                        </Button>
                      </Popconfirm>
                    ) : (
                      <Button
                        ghost
                        onClick={() => {
                          fields.remove(index);
                        }}
                        className="position-right no-margin"
                      >
                        <img name="remove" src={TRASHCAN} alt="Remove MineType" />
                      </Button>
                    )}
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
                      isEditView && contacts[index]
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
          ))
          .filter((field, index) => !contacts[index] || !contacts[index].state_modified)}
        <Col lg={12} sm={24}>
          <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
            <div
              className="add-content-block"
              onClick={() => fields.push({ mine_party_appt_type_code: "", party_guid: "" })}
            >
              <div className="inline-flex flex-center">
                <PlusOutlined className="icon-sm padding-small--right" />
                <p>Add New Contact</p>
              </div>
            </div>
          </AuthorizationWrapper>
        </Col>
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
      isEditView={props.isEditView}
      arrayPushReduxForms={props.arrayPush}
      arrayRemoveReduxForms={props.arrayRemove}
    />
  );
};

NOWContactForm.propTypes = propTypes;

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      arrayPush,
      arrayRemove,
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(NOWContactForm);
