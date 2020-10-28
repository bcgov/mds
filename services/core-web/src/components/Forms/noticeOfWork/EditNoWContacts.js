/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { v4 as uuidv4 } from "uuid";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Col, Row, Button, Card, Popconfirm } from "antd";
import { PlusOutlined, PhoneOutlined, MailOutlined, DoubleRightOutlined } from "@ant-design/icons";
import { FieldArray, Field, change } from "redux-form";
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
import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@common/constants/strings";

import Address from "@/components/common/Address";

import PartySelectField from "@/components/common/PartySelectField";
import RenderSelect from "@/components/common/RenderSelect";
import RenderField from "@/components/common/RenderField";

const propTypes = {
  contacts: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  partyRelationshipTypesList: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  addPartyFormState: PropTypes.objectOf(PropTypes.any).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  isEditView: PropTypes.bool,
  isVerifying: PropTypes.bool,
  change: PropTypes.func.isRequired,
  contactFormValues: PropTypes.arrayOf(
    PropTypes.objectOf(PropTypes.shape({ party: CustomPropTypes.party }))
  ).isRequired,
};

const defaultProps = {
  isEditView: false,
  isVerifying: false,
};

const handleRemove = (fields, index) => {
  const promise = new Promise(function(resolve, reject) {
    resolve(fields.push({ ...fields.get(index), state_modified: "delete" }));
  });
  // fields.push({ ...fields.get(index), state_modified: "delete" });

  return promise.then(() => {
    fields.remove(index);
  });
};

const renderContacts = ({
  fields,
  contacts,
  partyRelationshipTypes,
  isEditView,
  changeArray,
  rolesUsedOnce,
  isVerifying,
}) => {
  const filteredRelationships = partyRelationshipTypes.filter((pr) =>
    ["MMG", "PMT", "THD", "LDO", "AGT", "EMM", "MOR"].includes(pr.value)
  );

  // const removeActivity = (fields, index) => {
  //   if (fields.get(index) && fields.get(index).activity_detail_id) {
  //     // add state_modified and set to "delete" for backend
  //     fields.get(index).state_modified = "delete";

  //     // move updated object, this will cause rerendering of the react component, setTimeout is required to bypass react optimization
  //     // eslint-disable-next-line no-constant-condition
  //     setTimeout(() => {
  //       const res = fields.move(index, (index = 0 ? index + 1 : index - 1));
  //       return res;
  //     }, 1);
  //   } else {
  //     fields.remove(index);
  //   }
  // };

  return (
    <>
      <Row gutter={24}>
        {fields
          .map((field, index) => {
            const contactExists = fields.get(index) && fields.get(index).now_party_appointment_id;
            const initialParty =
              isEditView && contactExists
                ? {
                    label: fields.get(index).party.name,
                    value: fields.get(index).party_guid,
                  }
                : undefined;
            return (
              // eslint-disable-next-line react/no-array-index-key
              <Col lg={12} sm={24} key={fields.get(index).id}>
                <Card
                  style={
                    contactExists
                      ? { height: "500px" }
                      : { boxShadow: "0px 4px 4px #7c66ad", height: "500px" }
                  }
                  className="ant-card-now"
                  title={
                    <div
                      className="inline-flex"
                      style={{
                        alignItems: "center",
                        height: "55px",
                      }}
                    >
                      <img
                        className="icon-sm padding-md--right"
                        src={PROFILE_NOCIRCLE}
                        alt="user"
                        height={25}
                      />
                      <span className="field-title">{`Application ${
                        contactExists ? fields.get(index).mine_party_appt_type_code_description : ""
                      }`}</span>

                      {contactExists ? (
                        <Popconfirm
                          className="position-right no-margin"
                          placement="topLeft"
                          title={`Are you sure you want to remove ${startCase(
                            fields.get(index).party.name
                          )} as a contact on this Notice of Work?`}
                          okText="Delete"
                          cancelText="Cancel"
                          onConfirm={() => {
                            // if (fields.get(index)) {
                            //   // add state_modified and set to "delete" for backend
                            //   fields.get(index).state_modified = "delete";

                            //   changeArray(FORM.EDIT_NOTICE_OF_WORK, "contacts", fields.getAll());

                            //   // move updated object, this will cause rerendering of the react component, setTimeout is required to bypass react optimization
                            //   setTimeout(() => {
                            //     // eslint-disable-next-line no-constant-condition
                            //     const res = fields.move(index, (index = 0 ? index + 1 : index - 1));
                            //     return res;
                            //   }, 1);
                            // console.log(fields.get(index));
                            // // console.log(fields.get(index));
                            // console.log("are we deleting?? orrr");
                            // // add state_modified and set to "delete" for backend
                            // // fields.get(index) = { state_modified: "delete", ...fields.get(index) };
                            // // fields.push({ ...fields.get(index), state_modified: "delete" });
                            handleRemove(fields, index);
                            // // fields.remove(index);

                            // // changeArray(FORM.EDIT_NOTICE_OF_WORK, "contacts", contacts);

                            // // move updated object, this will cause rerendering of the react component, setTimeout is required to bypass react optimization
                            // setTimeout(() => {
                            //   // eslint-disable-next-line no-constant-condition
                            //   const res = fields.move(index, (index = 0 ? index + 1 : index - 1));
                            //   return res;
                            // }, 1);
                            // }
                          }}
                        >
                          <Button className="full-mobile" ghost type="primary">
                            <img name="remove" src={TRASHCAN} alt="Remove User" />
                          </Button>
                        </Popconfirm>
                      ) : (
                        <Button
                          ghost
                          onClick={() => {
                            console.log(" why why why why why why");
                            fields.remove(index);
                            // contacts.splice(index, 1);
                            // changeArray(FORM.EDIT_NOTICE_OF_WORK, "contacts", contacts);
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
                  <Row>
                    {isVerifying && (
                      <Col span={12}>
                        <h4>
                          {contactExists ? startCase(fields.get(index).party.name) : "New Contact"}
                        </h4>
                        {contactExists && (
                          <div>
                            <div className="inline-flex">
                              <div className="padding-right">
                                <MailOutlined className="icon-sm" />
                              </div>
                              {fields.get(index).party.email &&
                              fields.get(index).party.email !== "Unknown" ? (
                                <a href={`mailto:${fields.get(index).party.email}`}>
                                  {fields.get(index).party.email}
                                </a>
                              ) : (
                                <p>{Strings.EMPTY_FIELD}</p>
                              )}
                            </div>
                            <div className="inline-flex">
                              <div className="padding-right">
                                <PhoneOutlined className="icon-sm" />
                              </div>
                              <p>
                                {fields.get(index).party.phone_no}{" "}
                                {fields.get(index).party.phone_ext
                                  ? `x${fields.get(index).party.phone_ext}`
                                  : ""}
                              </p>
                            </div>
                            <Address address={fields.get(index).party.address[0] || {}} />
                          </div>
                        )}
                      </Col>
                    )}
                    <Col span={isVerifying ? 12 : 24}>
                      <Form.Item label="Role*">
                        <Field
                          usedOptions={rolesUsedOnce}
                          id={`${field}.mine_party_appt_type_code`}
                          name={`${field}.mine_party_appt_type_code`}
                          component={RenderSelect}
                          data={filteredRelationships}
                          validate={[required]}
                        />
                      </Form.Item>
                      <Form.Item label="Role*">
                        <Field
                          id={`${field}.party.name`}
                          name={`${field}.party.name`}
                          component={RenderField}
                          validate={[required]}
                        />
                      </Form.Item>
                      <p> {isEditView && contactExists && fields.get(index).party.name}</p>
                      <p>
                        {" "}
                        {`PARENT:${isEditView &&
                          contactExists &&
                          fields.get(index).party.party_guid}`}
                      </p>
                      <Form.Item>
                        <PartySelectField
                          id={`${field}.party_guid`}
                          name={`${field}.party_guid`}
                          initialValue={initialParty}
                          label={`${isVerifying ? "Matching Core " : ""}Contact*`}
                          partyLabel="Contact"
                          validate={[required]}
                          allowAddingParties
                          initialValues={
                            contactExists
                              ? {
                                  ...fields.get(index).party,
                                  ...(fields.get(index).party.address.length > 0
                                    ? fields.get(index).party.address[0]
                                    : {}),
                                }
                              : {}
                          }
                          initialSearch={contactExists ? fields.get(index).party.name : undefined}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Col>
            );
          })
          .filter((field, index) => !fields.get(index) || !fields.get(index).state_modified)}
        <Col lg={12} sm={24}>
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
  state = { rolesUsedOnce: [] };

  componentDidMount() {
    this.handleRoles(this.props.contactFormValues);
  }

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
      usedRoles = contacts.map(({ mine_party_appt_type_code }) => mine_party_appt_type_code);
    }
    const rolesUsedOnce = usedRoles.filter((role) => role === "PMT" || role === "MMG");
    return this.setState({ rolesUsedOnce });
  };

  componentWillReceiveProps = (nextProps) => {
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
  };

  render() {
    return (
      <FieldArray
        id="contacts"
        name="contacts"
        component={renderContacts}
        contacts={this.props.contacts
          .filter(({ state_modified }) => state_modified !== "delete")
          .map((contact) => {
            return { id: uuidv4(), ...contact };
          })}
        partyRelationshipTypes={this.props.partyRelationshipTypesList}
        isEditView={this.props.isEditView}
        isVerifying={this.props.isVerifying}
        changeArray={this.props.change}
        rolesUsedOnce={this.state.rolesUsedOnce}
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
