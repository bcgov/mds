/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { v4 as uuidv4 } from "uuid";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { isEmpty, startCase } from "lodash";
import { Col, Row, Button, Card, Result, Table } from "antd";
import { PlusOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";
import { FieldArray, Field } from "redux-form";

import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { getAddPartyFormState } from "@common/selectors/partiesSelectors";
import { getPartyRelationshipTypesList } from "@common/selectors/staticContentSelectors";
import { openModal, closeModal } from "@common/actions/modalActions";
import { modalConfig } from "@/components/modalContent/config";
import * as ModalContent from "@/constants/modalContent";
import { required, validateSelectOptions } from "@common/utils/Validate";
import {
  fetchSearchResults,
  clearAllSearchResults,
} from "@common/actionCreators/searchActionCreator";
import { storeSubsetSearchResults } from "@common/actions/searchActions";
import { TRASHCAN, PROFILE_NOCIRCLE } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import { getSearchResults, getSearchSubsetResults } from "@common/selectors/searchSelectors";
import * as Strings from "@common/constants/strings";

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
  wasFormReset: PropTypes.bool.isRequired,
  fetchSearchResults: PropTypes.func.isRequired,
  clearAllSearchResults: PropTypes.func.isRequired,
  searchResults: PropTypes.objectOf(PropTypes.any),
  searchSubsetResults: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {};

const columns = [
  {
    title: "Select All",
    dataIndex: "name",
    key: "name",
  },
];

const transformData = (results) =>
  results &&
  results.map(({ result }) => {
    return {
      key: result.party_guid,
      name: result.name,
    };
  });

const renderContacts = ({
  fields,
  partyRelationshipTypes,
  rolesUsedOnce,
  confirmedContacts,
  updateConfirmedList,
  contactFormValues,
  wasFormReset,
  handleSearch,
  searchResults,
  selectedRows,
  setSelectedRows,
}) => {
  const filteredRelationships = partyRelationshipTypes.filter((pr) =>
    ["MMG", "PMT", "THD", "LDO", "AGT", "EMM", "MOR"].includes(pr.value)
  );
  console.log(selectedRows);
  return (
    <>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Row style={{ backgroundColor: "#f3f0f0", padding: "25px", borderRadius: "5px" }}>
            <Col span={24} style={{ minHeight: "130px" }}>
              <h3>Application Contacts</h3>
              <p>
                Contacts listed here come from the original Notice of Work. Click &quot;Verify
                Contact&quot; to see a list of possible CORE matches in the &quot;Matching contact
                options&quot; column.
              </p>
            </Col>

            {fields.map((field, index) => {
              // eslint-disable-next-line no-unused-expressions
              fields.get(index).id
                ? (fields.get(index).id = fields.get(index).id)
                : (fields.get(index).id = uuidv4());
              const contactExists = fields.get(index) && !isEmpty(fields.get(index).party);
              const initialParty = contactExists
                ? {
                    label: fields.get(index).party.name,
                    value: fields.get(index).party_guid,
                  }
                : undefined;
              return (
                <Col span={24} key={fields.get(index).id}>
                  <Card
                    style={contactExists ? {} : { boxShadow: "0px 4px 4px #7c66ad" }}
                    className="ant-card-now white inherit-height "
                    title={
                      <div
                        className="inline-flex"
                        style={{
                          alignItems: "center",
                          height: "55px",
                        }}
                      >
                        <span className="field-title">{`Application ${
                          contactExists
                            ? fields.get(index).mine_party_appt_type_code_description
                            : ""
                        }`}</span>
                        {!confirmedContacts?.includes(fields.get(index).id) && (
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
                      <Col span={12}>
                        <div className="inline-flex">
                          <img className="icon-sm" src={PROFILE_NOCIRCLE} alt="user" height={25} />
                          <h4>
                            {contactExists
                              ? startCase(fields.get(index).party.name)
                              : "New Contact"}
                          </h4>
                        </div>
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
                            <Address address={fields.get(index).party?.address[0] || {}} />
                          </div>
                        )}
                      </Col>

                      <Col span={12}>
                        {/* <Field
                          usedOptions={rolesUsedOnce}
                          id={`${field}.mine_party_appt_type_code`}
                          name={`${field}.mine_party_appt_type_code`}
                          label="Role*"
                          component={RenderSelect}
                          data={filteredRelationships}
                          disabled={confirmedContacts?.includes(fields.get(index).id)}
                          validate={[required, validateSelectOptions(filteredRelationships)]}
                        />
                        <Field
                          id={`${field}.party_guid`}
                          name={`${field}.party_guid`}
                          label="Matching Core Contact*"
                          partyLabel="Contact"
                          validate={[required]}
                          component={NOWPartySelectField}
                          allowAddingParties
                          disabled={confirmedContacts?.includes(fields.get(index).id)}
                          initialValues={
                            contactExists
                              ? {
                                  ...fields.get(index).party,
                                  ...(fields.get(index).party.address.length > 0
                                    ? { ...fields.get(index).party.address[0], ...initialParty }
                                    : initialParty),
                                }
                              : {}
                          }
                          initialSearch={contactExists ? fields.get(index).party.name : undefined}
                          wasFormReset={wasFormReset}
                        /> */}
                        {!confirmedContacts?.includes(fields.get(index).id) ? (
                          <Button
                            type="primary"
                            style={{ float: "right" }}
                            onClick={(event) => handleSearch(event, fields.get(index).party.name)}
                          >
                            Verify Contact
                          </Button>
                        ) : (
                          <>
                            <div className="confirm-success">
                              <Result
                                className="position-right no-margin"
                                status="success"
                                title="Confirmed"
                              />
                            </div>
                            <Button
                              type="secondary"
                              className="position-right no-margin"
                              onClick={(event) => handleSearch(event, fields.get(index).party.name)}
                            >
                              Re-Verify Contact
                            </Button>
                          </>
                        )}
                      </Col>
                    </Row>
                  </Card>
                </Col>
              );
            })}
            <Col span={24}>
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
        </Col>
        <Col span={8}>
          <Row
            style={{
              backgroundColor: "#f3f0f0",
              padding: "25px",
              borderRadius: "5px",
            }}
          >
            <Col span={24} style={{ minHeight: "130px" }}>
              <h3>Matching Contact Options</h3>
              <p>
                Click on a contact(s) below to see their detailed information in the &quot;Contact
                detail&quot; column. If you cannot find a match, you can create a new contact.
              </p>
            </Col>
            <Col span={24} className="card--white">
              <p className="null">No Contact selected to verify</p>
            </Col>
            {/* {searchResults?.length > 0 && ( */}
            <Col span={24} className="card--white">
              <Table
                align="left"
                pagination={false}
                columns={columns}
                dataSource={transformData(searchResults)}
                locale={{
                  emptyText: "No Data Yet",
                }}
                rowSelection={
                  selectedRows
                    ? {
                        selectedRowKeys: selectedRows.selectedRows,
                        onChange: (selectedRowKeys) => {
                          selectedRows.setSelectedRows(selectedRowKeys);
                        },
                      }
                    : null
                }
              />
              {/* {searchResults?.map(({ result }) => {
                return <p>{result.name}</p>;
              })} */}
            </Col>
            {/* )} */}
          </Row>
        </Col>
        <Col span={8}>
          <Row
            style={{
              backgroundColor: "#f3f0f0",
              padding: "25px",
              borderRadius: "5px",
            }}
          >
            <Col span={24} style={{ minHeight: "130px" }}>
              <h3>Contact Detail</h3>
              <p>
                Use this information to determine if this is the correct contact to use in CORE for
                this application. Click &quot;Select Contact&quot; when you have found the right
                match.
              </p>
            </Col>
            <Col span={24} className="card--white">
              <p className="null">No Contact selected to verify</p>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export class VerifyNoWContacts extends Component {
  state = { rolesUsedOnce: [], confirmedContacts: [] };

  componentDidMount() {
    this.handleRoles(this.props.contactFormValues);
  }

  updateConfirmedContactList = (event, id) => {
    event.preventDefault();
    this.setState((prevState) => ({
      confirmedContacts: [id, ...prevState.confirmedContacts],
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
      usedRoles = contacts.map(({ mine_party_appt_type_code }) => mine_party_appt_type_code);
    }
    const rolesUsedOnce = usedRoles.filter((role) => role === "PMT" || role === "MMG");
    return this.setState({ rolesUsedOnce });
  };

  handleSearch = (e, searchTerm) => {
    e.preventDefault();
    return this.props.fetchSearchResults(searchTerm, "party");
  };

  componentWillReceiveProps = (nextProps) => {
    const formReset =
      nextProps.contactFormValues === this.props.contactFormValues && nextProps.wasFormReset;
    const contactsChanged = nextProps.contactFormValues !== this.props.contactFormValues;
    const selectedRowsChanged = this.props.selectedRows !== nextProps.selectedRows;
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

    if (formReset) {
      this.setState({ confirmedContacts: [] });
    }

    if (selectedRowsChanged) {
      console.log(nextProps.selectedRows);
      console.log("IT CHANGED????");
    }
  };

  componentWillUnmount() {
    return this.props.clearAllSearchResults();
  }

  render() {
    console.log(this.props.selectedRows);
    return (
      <FieldArray
        id="contacts"
        name="contacts"
        component={renderContacts}
        partyRelationshipTypes={this.props.partyRelationshipTypesList}
        rolesUsedOnce={this.state.rolesUsedOnce}
        confirmedContacts={this.state.confirmedContacts}
        updateConfirmedList={this.updateConfirmedContactList}
        contactFormValues={this.props.contactFormValues}
        wasFormReset={this.props.wasFormReset}
        handleSearch={this.handleSearch}
        searchResults={this.props.searchResults.party}
        selectedRows={this.props.selectedRows}
        setSelectedRows={this.props.setSelectedRows}
      />
    );
  }
}

VerifyNoWContacts.propTypes = propTypes;
VerifyNoWContacts.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  partyRelationshipTypesList: getPartyRelationshipTypesList(state),
  addPartyFormState: getAddPartyFormState(state),
  searchResults: getSearchResults(state),
  searchSubsetResults: getSearchSubsetResults(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      fetchSearchResults,
      clearAllSearchResults,
      storeSubsetSearchResults,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(VerifyNoWContacts);
