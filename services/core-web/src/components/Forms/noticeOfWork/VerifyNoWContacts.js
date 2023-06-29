import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { v4 as uuidv4 } from "uuid";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { isEmpty, startCase } from "lodash";
import { Col, Row, Button, Card, Result, Input, Alert } from "antd";
import { PlusOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";
import { FieldArray, Field, change } from "redux-form";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";

import * as FORM from "@/constants/forms";
import "@ant-design/compatible/assets/index.css";
import { getPartyRelationshipTypesList } from "@common/selectors/staticContentSelectors";
import { openModal, closeModal } from "@common/actions/modalActions";
import { modalConfig } from "@/components/modalContent/config";
import * as ModalContent from "@/constants/modalContent";
import { required } from "@common/utils/Validate";
import {
  fetchSearchResults,
  clearAllSearchResults,
} from "@common/actionCreators/searchActionCreator";
import { fetchPartyById, updateParty } from "@common/actionCreators/partiesActionCreator";
import { storeSubsetSearchResults } from "@common/actions/searchActions";
import { TRASHCAN, PROFILE_NOCIRCLE } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import { getSearchResults, getSearchSubsetResults } from "@common/selectors/searchSelectors";
import * as Strings from "@common/constants/strings";

import Address from "@/components/common/Address";
import AddButton from "@/components/common/buttons/AddButton";
import RenderSelect from "@/components/common/RenderSelect";
import CoreTable from "@/components/common/CoreTable";

const propTypes = {
  partyRelationshipTypesList: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  contactFormValues: PropTypes.arrayOf(
    PropTypes.objectOf(PropTypes.shape({ party: CustomPropTypes.party }))
  ).isRequired,
  wasFormReset: PropTypes.bool.isRequired,
  fetchSearchResults: PropTypes.func.isRequired,
  clearAllSearchResults: PropTypes.func.isRequired,
  searchResults: PropTypes.objectOf(PropTypes.any).isRequired,
  searchSubsetResults: PropTypes.objectOf(PropTypes.any).isRequired,
  change: PropTypes.func.isRequired,
  updateParty: PropTypes.func.isRequired,
  storeSubsetSearchResults: PropTypes.func.isRequired,
  fetchPartyById: PropTypes.func.isRequired,
  isImporting: PropTypes.func.isRequired,
};

const defaultProps = {};

const columns = [
  {
    title: "Select All",
    dataIndex: "name",
    key: "name",
    render: (text, record) => (
      <div>
        {text}
        <br />
        {record.email && record.email !== "Unknown" ? record.email : ""}
      </div>
    ),
  },
];

const transformData = (results) =>
  results &&
  results.map(({ result }) => {
    return {
      key: result.party_guid,
      name: result.name,
      ...result,
    };
  });

const renderContacts = ({
  fields,
  partyRelationshipTypes,
  rolesUsedOnce,
  confirmedContacts,
  contactFormValues,
  handleSearch,
  selectedContactIndex,
  selectedData,
  isImporting,
}) => {
  const filteredRelationships = partyRelationshipTypes.filter((pr) =>
    ["MMG", "PMT", "THD", "LDO", "AGT", "EMM", "MOR"].includes(pr.value)
  );
  return (
    <>
      <Col span={8}>
        <Row className="contact-rows">
          <div className="scroll">
            <Col span={24} style={{ minHeight: "150px" }}>
              <h3>Application Contacts</h3>
              <p>
                Contacts listed here come from the original Notice of Work. Click &quot;Search
                Contact&quot; to see a list of possible Core matches in the &quot;Matching Contact
                Options&quot; column. Ensure the correct role has been assigned to the application
                contact.
              </p>
            </Col>
            {fields.map((field, index) => {
              if (!fields.get(index).id) {
                fields.get(index).id = uuidv4();
              }
              const contactExists = fields.get(index) && !isEmpty(fields.get(index).party);

              const isSelectedContact = selectedContactIndex === index;
              const selectedCorePartyGuid = contactFormValues
                .filter(({ id }) => id === fields.get(index).id)
                .map(({ party_guid }) => party_guid)[0];
              const selectedCoreParty = selectedData
                .filter(({ value }) => selectedCorePartyGuid === value)
                .map((contact) => contact)[0];
              const contactInformation = selectedCoreParty || fields.get(index);
              const selectedClass = isSelectedContact ? "selected" : "";
              const appointmentCode = contactFormValues
                .filter(({ id }) => id === fields.get(index).id)
                .map(({ mine_party_appt_type_code }) => mine_party_appt_type_code)[0];
              return (
                <Col span={24} key={fields.get(index).id}>
                  <Card
                    hoverable
                    className={`ant-card-now white inherit-height ${selectedClass}`}
                    title={
                      <div
                        className="inline-flex between"
                        style={{
                          alignItems: "center",
                          height: "55px",
                        }}
                      >
                        <span className="field-title">{`Application ${
                          contactExists
                            ? fields.get(index).mine_party_appt_type_code_description
                            : "Contact"
                        }`}</span>
                        {!confirmedContacts?.includes(fields.get(index).id) ? (
                          <Button
                            ghost
                            disabled={isSelectedContact}
                            onClick={() => {
                              fields.remove(index);
                            }}
                          >
                            <img
                              name="remove"
                              src={TRASHCAN}
                              alt="Remove Application Contact"
                              className={isSelectedContact ? "disabled-icon" : ""}
                            />
                          </Button>
                        ) : (
                          <div className="confirm-success">
                            <Result status="success" title="Contact Confirmed" />
                          </div>
                        )}
                      </div>
                    }
                    bordered={false}
                  >
                    <Row align="middle" justify="center">
                      <Col span={15}>
                        <div className="inline-flex">
                          <img
                            className="icon-sm padding-sm--right"
                            src={PROFILE_NOCIRCLE}
                            alt="user"
                            height={25}
                          />
                          <h4>
                            {contactExists || selectedCoreParty
                              ? startCase(contactInformation.party.name)
                              : "New Contact"}
                          </h4>
                        </div>
                        {(contactExists || selectedCoreParty) && (
                          <div>
                            <div className="inline-flex">
                              <div className="padding-sm--right">
                                <MailOutlined className="icon-sm" />
                              </div>
                              {contactInformation.party.email &&
                              contactInformation.party.email !== "Unknown" ? (
                                <a href={`mailto:${contactInformation.party.email}`}>
                                  {contactInformation.party.email}
                                </a>
                              ) : (
                                <p>{Strings.EMPTY_FIELD}</p>
                              )}
                            </div>
                            <div className="inline-flex">
                              <div className="padding-sm--right">
                                <PhoneOutlined className="icon-sm" />
                              </div>
                              <p>
                                {contactInformation.party.phone_no}{" "}
                                {contactInformation.party.phone_ext
                                  ? `x${contactInformation.party.phone_ext}`
                                  : ""}
                              </p>
                            </div>
                            <Address address={contactInformation.party?.address[0] || {}} />
                          </div>
                        )}
                      </Col>

                      <Col span={9}>
                        <Field
                          usedOptions={rolesUsedOnce}
                          id={`${field}.mine_party_appt_type_code`}
                          name={`${field}.mine_party_appt_type_code`}
                          label="Role*"
                          component={RenderSelect}
                          data={filteredRelationships}
                          validate={[required]}
                        />
                        {confirmedContacts?.includes(fields.get(index).id) && (
                          <Field
                            usedOptions={rolesUsedOnce}
                            id={`${field}.party_guid`}
                            name={`${field}.party_guid`}
                            label="Selected Core contact"
                            component={RenderSelect}
                            data={selectedData}
                            disabled
                            validate={[required]}
                          />
                        )}
                      </Col>
                    </Row>
                    <Row>
                      <Col span={12} />
                      <Col span={12}>
                        {!confirmedContacts?.includes(fields.get(index).id) ? (
                          <Button
                            type="primary"
                            style={{ float: "right" }}
                            disabled={isSelectedContact || !appointmentCode}
                            onClick={(event) => handleSearch(event, fields.get(index), index)}
                          >
                            Search Contact
                          </Button>
                        ) : (
                          <Button
                            type="secondary"
                            style={{ float: "right" }}
                            disabled={isImporting}
                            onClick={(event) => handleSearch(event, fields.get(index), index, true)}
                          >
                            Redo
                          </Button>
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
                    <PlusOutlined className="icon-sm padding-sm--right" />
                    <p>Add New Application Contact</p>
                  </div>
                </div>
              </AuthorizationWrapper>
            </Col>
          </div>
        </Row>
      </Col>
    </>
  );
};

export class VerifyNoWContacts extends Component {
  state = {
    rolesUsedOnce: [],
    searchTerm: "",
    selectedNOWContact: {},
    selectedNOWContactIndex: "",
    isLoading: false,
    allowSearch: false,
    selectedData: [],
    confirmedContacts: [],
    selectedRows: [],
  };

  componentDidMount() {
    // clear search redux state
    this.props.clearAllSearchResults();
    this.handleRoles(this.props.contactFormValues);
  }

  componentWillReceiveProps = (nextProps) => {
    const formReset = this.props.wasFormReset !== nextProps.wasFormReset && nextProps.wasFormReset;
    const contactsChanged = nextProps.contactFormValues !== this.props.contactFormValues;

    if (contactsChanged) {
      this.handleRoles(nextProps.contactFormValues);
    }

    if (formReset) {
      this.setState({
        selectedNOWContact: {},
        selectedNOWContactIndex: "",
        allowSearch: false,
        confirmedContacts: [],
        selectedRows: [],
      });
    }
  };

  componentWillUnmount() {
    return this.props.clearAllSearchResults();
  }

  showAddPartyModal = (e) => {
    e.preventDefault();
    this.props.openModal({
      props: {
        title: ModalContent.ADD_CONTACT,
        partyRelationshipTypesList: this.props.partyRelationshipTypesList,
        closeModal: this.props.closeModal,
        afterSubmit: this.handleReSearch,
        initialValues: {
          ...this.state.selectedNOWContact.party?.address[0],
          ...this.state.selectedNOWContact.party,
        },
      },
      content: modalConfig.ADD_QUICK_PARTY,
    });
  };

  handleReset = () => {
    this.props.clearAllSearchResults();
    this.setState({
      selectedNOWContact: {},
      selectedNOWContactIndex: "",
      allowSearch: false,
      isLoading: false,
      selectedRows: [],
    });
  };

  handleSelect = (e, party) => {
    e.preventDefault();
    this.setState((prevState) => ({
      isLoading: true,
      confirmedContacts: [prevState.selectedNOWContact.id, ...prevState.confirmedContacts],
    }));
    this.props.change(
      FORM.VERIFY_NOW_APPLICATION_FORM,
      `contacts[${this.state.selectedNOWContactIndex}].party_guid`,
      this.formatPartyOption(party, this.state.selectedNOWContact.id)
    );
    this.handleReset();
  };

  handleRoles = (contacts) => {
    let usedRoles = [];
    if (contacts.length > 0) {
      usedRoles = contacts.map(({ mine_party_appt_type_code }) => mine_party_appt_type_code);
    }
    const rolesUsedOnce = usedRoles.filter((role) => role === "PMT" || role === "MMG");
    return this.setState({ rolesUsedOnce });
  };

  handleSearch = (e, contact, index, reverify = false) => {
    const searchTerm = contact.party?.name ?? "";
    if (reverify) {
      // eslint-disable-next-line react/no-access-state-in-setstate
      const updatedConfirmedContact = this.state.confirmedContacts.filter(
        (id) => id !== contact.id
      );
      // eslint-disable-next-line react/no-access-state-in-setstate
      const updatedData = this.state.selectedData.filter(
        ({ contactID }) => contactID !== contact.id
      );
      this.setState({ selectedData: updatedData, confirmedContacts: updatedConfirmedContact });

      this.props.change(FORM.VERIFY_NOW_APPLICATION_FORM, `contacts[${index}].party_guid`, null);
    }

    this.setState({
      searchTerm,
      allowSearch: true,
      selectedNOWContact: contact,
      isLoading: true,
      selectedNOWContactIndex: index,
    });
    e.preventDefault();
    this.props.clearAllSearchResults();
    return this.props.fetchSearchResults(searchTerm, "party").then(() => {
      this.setState({ isLoading: false, selectedRows: [] });
    });
  };

  handleSimpleSearch = (searchTerm) => {
    this.setState({ isLoading: true, allowSearch: true });
    return this.props.fetchSearchResults(searchTerm, "party").then(() => {
      this.setState({ isLoading: false });
    });
  };

  editParty = (partyGuid) => (values) => {
    return this.props.updateParty(values, partyGuid).then(() => {
      this.props.closeModal();
      this.props.clearAllSearchResults();
      this.handleReSearch();
    });
  };

  handleReSearch = (partyGuid = null) => {
    if (partyGuid) {
      this.handleSelectedRows([partyGuid, ...this.state.selectedRows]);
    }
    this.setState({ isLoading: true });
    this.props.fetchSearchResults(this.state.searchTerm, "party").then(({ data }) => {
      const subSetResults = data?.search_results?.party.filter(({ result }) =>
        this.state.selectedRows.includes(result.party_guid)
      );
      this.setState({ isLoading: false });
      return this.props.storeSubsetSearchResults(subSetResults);
    });
  };

  openEditPartyModal = (event, partyGuid, name) => {
    event.preventDefault();
    this.props.fetchPartyById(partyGuid).then(() => {
      this.props.openModal({
        props: {
          partyGuid,
          onSubmit: this.editParty(partyGuid),
          title: `Update ${name}`,
          provinceOptions: [],
        },
        content: modalConfig.EDIT_PARTY,
        width: "75vw",
      });
    });
  };

  formatPartyOption = (party, contactID) => {
    const option = { value: party.party_guid, label: party.name, party, contactID };
    this.setState((prevState) => ({
      selectedData: [option, ...prevState.selectedData],
    }));
    return option.value;
  };

  renderCoreContacts = () => {
    return (
      <Col span={8}>
        <Row className="contact-rows">
          <div className="scroll">
            <Col span={24} style={{ minHeight: "150px" }}>
              <h3>Core Contact Detail</h3>
              <p>
                Use this information to determine if this is the correct contact to use in Core for
                this application. Click &quot;Select Contact&quot; when you have found the right
                match. You may update the contact if the information is incorrect.
              </p>
            </Col>

            {this.props.searchSubsetResults && this.props.searchSubsetResults.length > 0 ? (
              <Col span={24}>
                {this.props.searchSubsetResults.map(({ result }) => (
                  <Col span={24} key={result.party_guid}>
                    <Card className="ant-card-now no-header inherit-height " bordered={false}>
                      <Row>
                        <Col span={24}>
                          <div className="inline-flex">
                            <img
                              className="icon-sm padding-sm--right"
                              src={PROFILE_NOCIRCLE}
                              alt="user"
                              height={25}
                            />
                            <h4>{startCase(result.name)}</h4>
                          </div>
                          <div>
                            <div className="inline-flex">
                              <div className="padding-sm--right">
                                <MailOutlined className="icon-sm" />
                              </div>
                              {result.email && result.email !== "Unknown" ? (
                                <a href={`mailto:${result.email}`}>{result.email}</a>
                              ) : (
                                <p>{Strings.EMPTY_FIELD}</p>
                              )}
                            </div>
                            <div className="inline-flex">
                              <div className="padding-sm--right">
                                <PhoneOutlined className="icon-sm" />
                              </div>
                              <p>{result.phone_no}</p>
                            </div>
                            <Address address={result.address[0] || {}} />
                            {!result.phone_no && (
                              <Alert message="Phone number is required." type="error" showIcon />
                            )}
                          </div>
                        </Col>
                      </Row>
                      <div className="right center-mobile">
                        <Button
                          className="full-mobile"
                          type="secondary"
                          onClick={(e) =>
                            this.openEditPartyModal(e, result.party_guid, result.name)
                          }
                        >
                          Update Core Contact
                        </Button>
                        <Button
                          className="full-mobile"
                          type="primary"
                          onClick={(e) => this.handleSelect(e, result)}
                          disabled={!result.phone_no}
                        >
                          Select Contact
                        </Button>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Col>
            ) : (
              <Col span={24} className="card--white">
                <p className="null">No Contact selected to verify</p>
              </Col>
            )}
          </div>
        </Row>
      </Col>
    );
  };

  renderSearchResults = () => {
    return (
      <Col span={8}>
        <Row className="contact-rows">
          <div className="scroll">
            <Col span={24} style={{ minHeight: "150px" }}>
              <h3>Matching Contact Options</h3>
              <p>
                Click on a contact(s) below to see their detailed information in the &quot;Contact
                Detail&quot; column. If you cannot find a match, you can either search or create a
                new contact.
              </p>
            </Col>
            {this.state.allowSearch || this.state.isLoading ? (
              <Col span={24} className="card--white">
                <AddButton
                  style={{ float: "right" }}
                  onClick={(e) => this.showAddPartyModal(e)}
                  type="secondary"
                >
                  Add New Core Contact
                </AddButton>
                <Input.Search
                  placeholder="Search"
                  allowClear
                  type="buttom"
                  value={this.state.searchTerm}
                  onSearch={(searchTerm) => this.handleSimpleSearch(searchTerm)}
                  onChange={(e) => this.setState({ searchTerm: e.target.value })}
                />
                <br />
                <LoadingWrapper condition={!this.state.isLoading}>
                  <CoreTable
                    className="party-table"
                    columns={columns}
                    dataSource={transformData(this.props.searchResults.party)}
                    emptyText="No Results"
                    rowSelection={{
                      selectedRowKeys: this.state.selectedRows,
                      onChange: (selectedRowKeys) => {
                        this.handleSelectedRows(selectedRowKeys);
                      },
                    }}
                  />
                </LoadingWrapper>
              </Col>
            ) : (
              <Col span={24} className="card--white">
                <p className="null">No Contact selected to verify</p>
              </Col>
            )}
          </div>
        </Row>
      </Col>
    );
  };

  handleSelectedRows = (rows) => {
    const subSetResults = this.props.searchResults?.party.filter(({ result }) =>
      rows.includes(result.party_guid)
    );
    this.props.storeSubsetSearchResults(subSetResults);
    this.setState({ selectedRows: rows });
  };

  render() {
    return (
      <Row gutter={[16, 16]}>
        <FieldArray
          id="contacts"
          name="contacts"
          component={renderContacts}
          partyRelationshipTypes={this.props.partyRelationshipTypesList}
          rolesUsedOnce={this.state.rolesUsedOnce}
          confirmedContacts={this.state.confirmedContacts}
          contactFormValues={this.props.contactFormValues}
          handleSearch={this.handleSearch}
          selectedContactIndex={this.state.selectedNOWContactIndex}
          selectedData={this.state.selectedData}
          isImporting={this.props.isImporting}
        />
        {this.renderSearchResults()}
        {this.renderCoreContacts()}
      </Row>
    );
  }
}

VerifyNoWContacts.propTypes = propTypes;
VerifyNoWContacts.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  partyRelationshipTypesList: getPartyRelationshipTypesList(state),
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
      fetchPartyById,
      updateParty,
      change,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(VerifyNoWContacts);
