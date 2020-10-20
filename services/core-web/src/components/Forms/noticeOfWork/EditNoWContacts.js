import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Col, Row, Button, Card, Popconfirm } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { FieldArray, Field, arrayPush, arrayRemove } from "redux-form";
import { startCase } from "lodash";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { getAddPartyFormState } from "@common/selectors/partiesSelectors";
import { getPartyRelationshipTypesList } from "@common/selectors/staticContentSelectors";
import { openModal, closeModal } from "@common/actions/modalActions";
import { modalConfig } from "@/components/modalContent/config";
import * as ModalContent from "@/constants/modalContent";
import { required } from "@common/utils/Validate";
import { TRASHCAN, PROFILE_NOCIRCLE } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as FORM from "@/constants/forms";
import * as Permission from "@/constants/permissions";

import PartySelectField from "@/components/common/PartySelectField";
import RenderSelect from "@/components/common/RenderSelect";

const propTypes = {
  contacts: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  partyRelationshipTypesList: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  addPartyFormState: PropTypes.objectOf(PropTypes.any).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
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
            // eslint-disable-next-line react/no-array-index-key
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
              role="button"
              className="add-content-block"
              tabIndex="0"
              onKeyPress={() => fields.push({ mine_party_appt_type_code: "", party_guid: "" })}
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

export class EditNoWContacts extends Component {
  showAddPartyModal = () => {
    this.props.openModal({
      props: {
        title: ModalContent.ADD_CONTACT,
        partyRelationshipTypesList: this.props.partyRelationshipTypesList,
        closeModal: this.props.closeModal,
      },
      content: modalConfig.ADD_QUICK_PARTY,
    });
  };

  componentWillReceiveProps = (nextProps) => {
    if (
      nextProps.addPartyFormState.showingAddPartyForm &&
      this.props.addPartyFormState.showingAddPartyForm !==
        nextProps.addPartyFormState.showingAddPartyForm
    ) {
      this.showAddPartyModal();
    }
  };

  render() {
    return (
      <FieldArray
        id="contacts"
        name="contacts"
        component={renderContacts}
        contacts={this.props.contacts}
        partyRelationshipTypes={this.props.partyRelationshipTypesList}
        isEditView={this.props.isEditView}
        arrayPushReduxForms={this.props.arrayPush}
        arrayRemoveReduxForms={this.props.arrayRemove}
      />
    );
  }
}

EditNoWContacts.propTypes = propTypes;
EditNoWContacts.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  partyRelationshipTypesList: getPartyRelationshipTypesList(state),
  addPartyFormState: getAddPartyFormState(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      arrayPush,
      arrayRemove,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(EditNoWContacts);
