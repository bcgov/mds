/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { v4 as uuidv4 } from "uuid";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { startCase } from "lodash";
import { Col, Row, Button, Card, Popconfirm } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { FieldArray, Field, change } from "redux-form";

import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { getAddPartyFormState } from "@mds/common/redux/selectors/partiesSelectors";
import { getPartyRelationshipTypesList } from "@mds/common/redux/selectors/staticContentSelectors";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { modalConfig } from "@/components/modalContent/config";
import * as ModalContent from "@/constants/modalContent";
import { required, validateSelectOptions } from "@common/utils/Validate";
import { TRASHCAN, PROFILE_NOCIRCLE, EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import * as Strings from "@mds/common/constants/strings";
import * as router from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import { Link } from "react-router-dom";
import Address from "@/components/common/Address";

import NOWPartySelectField from "@/components/common/NOWPartySelectField";
import RenderSelect from "@/components/common/RenderSelect";

const propTypes = {
  partyRelationshipTypesList: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  addPartyFormState: PropTypes.objectOf(PropTypes.any).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  contactFormValues: PropTypes.arrayOf(
    PropTypes.objectOf(PropTypes.shape({ party: CustomPropTypes.party }))
  ).isRequired,
  contact: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.shape({ party: CustomPropTypes.party })))
    .isRequired,
};

const defaultProps = {};

const handleRemove = (fields, index) => {
  const promise = new Promise((resolve) =>
    resolve(fields.push({ ...fields.get(index), state_modified: "delete" }))
  );
  return promise.then(() => {
    fields.remove(index);
  });
};

const NOWContact = ({
  field,
  contact,
  handleRemove,
  editContact,
  updateEditedList,
  rolesUsedOnce,
  filteredRelationships,
  index,
}) => (
  <Card
    className="ant-card-now"
    title={
      <div className="inline-flex between wrap">
        <div>
          <h3>
            {!editContact?.includes(contact.now_party_appointment_id)
              ? contact.mine_party_appt_type_code_description
              : `Updating Application Contact`}
          </h3>
          {editContact?.includes(contact.now_party_appointment_id) && (
            <span className="inline-flex">
              <p>Previously: </p>
              <p className="p-light">
                {" "}
                {startCase(contact.party.name)} ({contact.mine_party_appt_type_code_description})
              </p>
            </span>
          )}
        </div>
        <div>
          {!editContact?.includes(contact.now_party_appointment_id) && (
            <Button
              ghost
              className="no-margin"
              onClick={() => updateEditedList(contact.now_party_appointment_id)}
            >
              <img alt="pencil" src={EDIT_OUTLINE_VIOLET} />
            </Button>
          )}
          <Popconfirm
            className="no-margin"
            placement="topLeft"
            title={`Are you sure you want to remove the ${
              contact.mine_party_appt_type_code_description
            }, ${startCase(contact.party.name)}, as a contact on this Notice of Work?`}
            okText="Delete"
            cancelText="Cancel"
            onConfirm={handleRemove}
          >
            <Button ghost>
              <img name="remove" src={TRASHCAN} alt="Remove User" />
            </Button>
          </Popconfirm>
        </div>
      </div>
    }
    bordered={false}
  >
    <div>
      {editContact?.includes(contact.now_party_appointment_id) ? (
        <>
          <Row align="middle" justify="center">
            <Col span={24}>
              <Form.Item label="Role*">
                <Field
                  usedOptions={rolesUsedOnce}
                  id={`${field}.mine_party_appt_type_code`}
                  name={`${field}.mine_party_appt_type_code`}
                  component={RenderSelect}
                  data={filteredRelationships}
                  validate={[required, validateSelectOptions(filteredRelationships)]}
                />
              </Form.Item>
              <Form.Item>
                <Field
                  id={`${field}.party_guid`}
                  name={`${field}.party_guid`}
                  label="Contact*"
                  partyLabel="Contact"
                  validate={[required]}
                  component={NOWPartySelectField}
                  allowAddingParties
                  initialValues={{
                    label: contact.party.name,
                    value: contact.party_guid,
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </>
      ) : (
        <>
          <h4>
            <Link
              style={{ fontSize: "1.5rem", fontWeight: "bold" }}
              to={router.PARTY_PROFILE.dynamicRoute(contact.party.party_guid)}
            >
              {contact.party.name}
            </Link>
          </h4>
          <br />
          <h6>Email Address</h6>
          {contact.party.email ? (
            <a href={`mailto:${contact.party.email}`}>{contact.party.email}</a>
          ) : (
            <span>{Strings.EMPTY_FIELD}</span>
          )}
          <br />
          <br />
          <h6>Phone Number</h6>
          {contact.party.phone_no} {contact.party.phone_ext ? `x${contact.party.phone_ext}` : ""}
          <br />
          <br />
          <h6>Mailing Address</h6>
          <Address address={contact.party.address.length > 0 && contact.party.address[0]} />
        </>
      )}
    </div>
  </Card>
);

const renderContacts = ({
  fields,
  partyRelationshipTypes,
  rolesUsedOnce,
  editContact,
  updateEditedList,
}) => {
  const filteredRelationships = partyRelationshipTypes.filter((pr) =>
    ["MMG", "PMT", "THD", "LDO", "AGT", "EMM", "MOR"].includes(pr.value)
  );
  return (
    <>
      <Row gutter={24}>
        {fields
          .map((field, index) => {
            const contactExists = fields.get(index) && fields.get(index).now_party_appointment_id;
            return (
              <Col
                key={
                  contactExists ? fields.get(index).now_party_appointment_id : fields.get(index).id
                }
                sm={24}
                lg={12}
                xxl={8}
              >
                {contactExists ? (
                  <NOWContact
                    filteredRelationships={filteredRelationships}
                    rolesUsedOnce={rolesUsedOnce}
                    field={field}
                    index={index}
                    contact={fields.get(index)}
                    handleRemove={() => handleRemove(fields, index)}
                    editContact={editContact}
                    updateEditedList={updateEditedList}
                  />
                ) : (
                  <Card
                    style={{ boxShadow: "0px 4px 4px #7c66ad" }}
                    className="ant-card-now"
                    title={
                      <div className="inline-flex">
                        <h3>
                          <img
                            className="icon-sm padding-md--right"
                            src={PROFILE_NOCIRCLE}
                            alt="user"
                            height={25}
                          />
                          New Application Contact
                        </h3>
                        <Button
                          ghost
                          onClick={() => {
                            fields.remove(index);
                          }}
                          className="position-right no-margin"
                        >
                          <img name="remove" src={TRASHCAN} alt="Remove New Contact" />
                        </Button>
                      </div>
                    }
                    bordered={false}
                  >
                    <div>
                      <br />
                      <Row align="middle" justify="center">
                        <Col span={24}>
                          <Form.Item label="Role*">
                            <Field
                              usedOptions={rolesUsedOnce}
                              id={`${field}.mine_party_appt_type_code`}
                              name={`${field}.mine_party_appt_type_code`}
                              component={RenderSelect}
                              data={filteredRelationships}
                              validate={[required, validateSelectOptions(filteredRelationships)]}
                            />
                          </Form.Item>
                          <Form.Item>
                            <Field
                              id={`${field}.party_guid`}
                              name={`${field}.party_guid`}
                              label="Contact*"
                              partyLabel="Contact"
                              validate={[required]}
                              component={NOWPartySelectField}
                              allowAddingParties
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  </Card>
                )}
              </Col>
            );
          })
          .filter((field, index) => !fields.get(index) || !fields.get(index).state_modified)}
        <Col sm={24} lg={12} xxl={8}>
          <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
            <div
              role="button"
              className="add-content-block"
              tabIndex="0"
              onKeyPress={() =>
                fields.push({ mine_party_appt_type_code: "", party_guid: "", id: uuidv4() })
              }
              onClick={() =>
                fields.push({ mine_party_appt_type_code: "", party_guid: "", id: uuidv4() })
              }
            >
              <div className="inline-flex flex-center">
                <PlusOutlined className="icon-sm padding-sm--right" />
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
  state = { rolesUsedOnce: [], editContact: [] };

  componentDidMount() {
    this.handleRoles(this.props.contactFormValues);
  }

  updateEditedContactList = (id) => {
    this.setState((prevState) => ({
      editContact: [id, ...prevState.editContact],
    }));
  };

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

  handleRoles = (contacts) => {
    let usedRoles = [];
    if (contacts.length > 0) {
      usedRoles = contacts.map(
        ({ mine_party_appt_type_code, state_modified }) =>
          !state_modified && mine_party_appt_type_code
      );
    }
    const rolesUsedOnce = usedRoles.filter((role) => role === "PMT" || role === "MMG");
    return this.setState({ rolesUsedOnce });
  };

  componentWillReceiveProps = (nextProps) => {
    const nowWasSaved = this.props.initialValues !== nextProps.initialValues;
    const contactsChanged = nextProps.contactFormValues !== this.props.contactFormValues;
    if (
      nextProps.addPartyFormState.showingAddPartyForm &&
      this.props.addPartyFormState.showingAddPartyForm !==
        nextProps.addPartyFormState.showingAddPartyForm
    ) {
      this.showAddPartyModal();
    }

    if (contactsChanged) {
      this.handleRoles(nextProps.contactFormValues);
    }

    if (nowWasSaved) {
      this.setState({ editContact: [] });
    }
  };

  render() {
    return (
      <FieldArray
        id="contacts"
        name="contacts"
        component={renderContacts}
        partyRelationshipTypes={this.props.partyRelationshipTypesList}
        rolesUsedOnce={this.state.rolesUsedOnce}
        editContact={this.state.editContact}
        updateEditedList={this.updateEditedContactList}
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
      change,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(EditNoWContacts);
