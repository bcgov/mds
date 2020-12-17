import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { v4 as uuidv4 } from "uuid";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { startCase } from "lodash";
import { Col, Row, Button, Card, Popconfirm } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { FieldArray, Field } from "redux-form";

import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { getAddPartyFormState } from "@common/selectors/partiesSelectors";
import { getPartyRelationshipTypesList } from "@common/selectors/staticContentSelectors";
import { openModal, closeModal } from "@common/actions/modalActions";
import { modalConfig } from "@/components/modalContent/config";
import * as ModalContent from "@/constants/modalContent";
import { required, validateSelectOptions } from "@common/utils/Validate";
import { TRASHCAN, PROFILE_NOCIRCLE } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
// import CustomPropTypes from "@/customPropTypes";

import NOWPartySelectField from "@/components/common/NOWPartySelectField";
import RenderSelect from "@/components/common/RenderSelect";

const propTypes = {
  partyRelationshipTypesList: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  addPartyFormState: PropTypes.objectOf(PropTypes.any).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  // contactFormValues: PropTypes.arrayOf(
  //   PropTypes.objectOf(PropTypes.shape({ party: CustomPropTypes.party }))
  // ).isRequired,
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

const renderContacts = ({ fields, partyRelationshipTypes, rolesUsedOnce }) => {
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
                lg={12}
                sm={24}
                key={
                  contactExists ? fields.get(index).now_party_appointment_id : fields.get(index).id
                }
              >
                <Card
                  style={contactExists ? {} : { boxShadow: "0px 4px 4px #7c66ad" }}
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
                            handleRemove(fields, index);
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
                          initialValues={
                            contactExists
                              ? {
                                  label: fields.get(index).party.name,
                                  value: fields.get(index).party_guid,
                                }
                              : {}
                          }
                          initialSearch={contactExists ? fields.get(index).party.name : undefined}
                        />
                      </Form.Item>
                      {/* <NOWPartySelectField
                          id={`${field}.party_guid`}
                          name={`${field}.party_guid`}
                          label="Contact*"
                          partyLabel="Contact"
                          validate={[required]}
                          allowAddingParties
                          initialValues={
                            contactExists
                              ? {
                                  label: fields.get(index).party.name,
                                  value: fields.get(index).party_guid,
                                }
                              : {}
                          }
                          initialSearch={contactExists ? fields.get(index).party.name : undefined}
                        />
                      </Form.Item> */}
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
  state = { rolesUsedOnce: [] };

  componentDidMount() {
    // this.handleRoles(this.props.contactFormValues);
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

  // handleRoles = (contacts) => {
  //   let usedRoles = [];
  //   if (contacts.length > 0) {
  //     usedRoles = contacts.map(
  //       ({ mine_party_appt_type_code, state_modified }) =>
  //         !state_modified && mine_party_appt_type_code
  //     );
  //   }
  //   const rolesUsedOnce = usedRoles.filter((role) => role === "PMT" || role === "MMG");
  //   return this.setState({ rolesUsedOnce });
  // };

  componentWillReceiveProps = (nextProps) => {
    // const contactsChanged = nextProps.contactFormValues !== this.props.contactFormValues;
    if (
      nextProps.addPartyFormState.showingAddPartyForm &&
      this.props.addPartyFormState.showingAddPartyForm !==
        nextProps.addPartyFormState.showingAddPartyForm
    ) {
      this.showAddPartyModal();
    }

    // if (contactsChanged) {
    //   this.handleRoles(nextProps.contactFormValues);
    // }
  };

  render() {
    return (
      <FieldArray
        id="contacts"
        name="contacts"
        component={renderContacts}
        partyRelationshipTypes={this.props.partyRelationshipTypesList}
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
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(EditNoWContacts);
