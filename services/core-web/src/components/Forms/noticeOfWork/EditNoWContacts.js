import React, { Component } from "react";
import { bindActionCreators } from "redux";
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

  return (
    <>
      <Row gutter={24}>
        {fields
          .map((field, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Col lg={12} sm={24} key={index}>
              <Card
                style={contacts[index] ? {} : { boxShadow: "0px 4px 4px #7c66ad" }}
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
                      contacts[index] ? contacts[index].mine_party_appt_type_code_description : ""
                    }`}</span>

                    {contacts[index] && contacts[index].now_party_appointment_id ? (
                      <Popconfirm
                        className="position-right no-margin"
                        placement="topLeft"
                        title={`Are you sure you want to remove ${startCase(
                          contacts[index].party.name
                        )} as a contact on this Notice of Work?`}
                        onConfirm={() => {
                          if (fields.get(index)) {
                            // add state_modified and set to "delete" for backend
                            contacts[index].state_modified = "delete";

                            changeArray(FORM.EDIT_NOTICE_OF_WORK, "contacts", contacts);

                            // move updated object, this will cause rerendering of the react component, setTimeout is required to bypass react optimization
                            setTimeout(() => {
                              // eslint-disable-next-line no-constant-condition
                              const res = fields.move(index, (index = 0 ? index + 1 : index - 1));
                              return res;
                            }, 1);
                          }
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
                          contacts.splice(index, 1);
                          changeArray(FORM.EDIT_NOTICE_OF_WORK, "contacts", contacts);
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
                <Row align="middle" justify="center">
                  {isVerifying && (
                    <>
                      <Col span={9}>
                        <h4>
                          {contacts[index] ? startCase(contacts[index].party.name) : "New Contact"}
                        </h4>
                        {contacts[index] && (
                          <div>
                            <div className="inline-flex">
                              <div className="padding-right">
                                <MailOutlined className="icon-sm" />
                              </div>
                              {contacts[index].party.email &&
                              contacts[index].party.email !== "Unknown" ? (
                                <a href={`mailto:${contacts[index].party.email}`}>
                                  {contacts[index].party.email}
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
                                {contacts[index].party.phone_no}{" "}
                                {contacts[index].party.phone_ext
                                  ? `x${contacts[index].party.phone_ext}`
                                  : ""}
                              </p>
                            </div>
                            <Address address={contacts[index].party.address[0] || {}} />
                          </div>
                        )}
                      </Col>
                      <Col span={3}>
                        <DoubleRightOutlined className="icon-xxl--lightgrey" />
                      </Col>
                    </>
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
                        label={`${isVerifying ? "Matching Core " : ""}Contact*`}
                        partyLabel="Contact"
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
                  </Col>
                </Row>
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
    const usedRoles = [];
    if (contacts.length > 0) {
      contacts.map(({ mine_party_appt_type_code }) => usedRoles.push(mine_party_appt_type_code));
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
        contacts={this.props.contacts}
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
