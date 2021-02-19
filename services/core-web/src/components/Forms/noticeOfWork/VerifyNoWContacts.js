/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { v4 as uuidv4 } from "uuid";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { isEmpty, startCase } from "lodash";
import { Col, Row, Button, Card, Result, Table, Input } from "antd";
import { PlusOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";
import { FieldArray, Field, change } from "redux-form";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";

import * as FORM from "@/constants/forms";
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
import { fetchPartyById, updateParty } from "@common/actionCreators/partiesActionCreator";
import { storeSubsetSearchResults } from "@common/actions/searchActions";
import { TRASHCAN, PROFILE_NOCIRCLE } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import { getSearchResults, getSearchSubsetResults } from "@common/selectors/searchSelectors";
import * as Strings from "@common/constants/strings";

import Address from "@/components/common/Address";
import AddButton from "@/components/common/AddButton";

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
  updateConfirmedList,
  contactFormValues,
  wasFormReset,
  handleSearch,
  selectedContactIndex,
  selectedData,
}) => {
  const filteredRelationships = partyRelationshipTypes.filter((pr) =>
    ["MMG", "PMT", "THD", "LDO", "AGT", "EMM", "MOR"].includes(pr.value)
  );
  return (
    <>
      <Col span={8}>
        <Row className="contact-rows">
          <Col span={24} style={{ minHeight: "130px" }}>
            <h3>Application Contacts</h3>
            <p>
              Contacts listed here come from the original Notice of Work. Click &quot;Search
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

            const isSelectedContact = selectedContactIndex === index;
            const selectedCorePartyGuid = contactFormValues
              .filter(({ id }) => id === fields.get(index).id)
              .map(({ party_guid }) => party_guid)[0];
            const selectedCoreParty = selectedData
              .filter(({ value }) => selectedCorePartyGuid === value)
              .map((contact) => contact)[0];
            const contactInformation = selectedCoreParty ? selectedCoreParty : fields.get(index);
            return (
              <Col span={24} key={fields.get(index).id}>
                <Card
                  hoverable
                  style={
                    isSelectedContact ? { boxShadow: "rgb(124 102 173) 0px 0px 10px 3px" } : {}
                  }
                  className="ant-card-now white inherit-height "
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
                          onClick={() => {
                            fields.remove(index);
                          }}
                        >
                          <img name="remove" src={TRASHCAN} alt="Remove MineType" />
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
                    <Col span={12}>
                      <div className="inline-flex">
                        <img className="icon-sm" src={PROFILE_NOCIRCLE} alt="user" height={25} />
                        <h4>
                          {contactExists || selectedCoreParty
                            ? startCase(contactInformation.party.name)
                            : "New Contact"}
                        </h4>
                      </div>
                      {(contactExists || selectedCoreParty) && (
                        <div>
                          <div className="inline-flex">
                            <div className="padding-right">
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
                            <div className="padding-right">
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

                    <Col span={12}>
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
                          label="Selected CORE contact"
                          component={RenderSelect}
                          data={selectedData}
                          // disabled
                          validate={[required]}
                        />
                      )}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12}></Col>
                    <Col span={12}>
                      {!confirmedContacts?.includes(fields.get(index).id) ? (
                        <Button
                          type="primary"
                          style={{ float: "right" }}
                          disabled={isSelectedContact}
                          onClick={(event) => handleSearch(event, fields.get(index), index)}
                        >
                          Search Contact
                        </Button>
                      ) : (
                        <Button
                          type="secondary"
                          style={{ float: "right" }}
                          onClick={(event) => handleSearch(event, fields.get(index), index, true)}
                        >
                          Re-Verify Contact
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
                  <PlusOutlined className="icon-sm padding-small--right" />
                  <p>Add New Contact</p>
                </div>
              </div>
            </AuthorizationWrapper>
          </Col>
        </Row>
      </Col>
    </>
  );
};

export class VerifyNoWContacts extends Component {
  state = {
    rolesUsedOnce: [],
    confirmedContacts: [],
    searchTerm: "",
    selectedNOWContact: {},
    selectedNOWContactIndex: "",
    isLoading: false,
    allowSearch: false,
    selectedData: [],
  };

  formatPartyOption = (party, contactID) => {
    const option = { value: party.party_guid, label: party.name, party, contactID };
    this.setState((prevState) => ({
      selectedData: [option, ...prevState.selectedData],
    }));
    return option.value;
  };
  componentDidMount() {
    // clear search redux state
    this.props.clearAllSearchResults();
    this.handleRoles(this.props.contactFormValues);
  }

  updateConfirmedContactList = (id) => {
    this.setState((prevState) => ({
      confirmedContacts: [id, ...prevState.confirmedContacts],
    }));
  };

  showAddPartyModal = (e) => {
    e.preventDefault();
    this.props.openModal({
      props: {
        title: ModalContent.ADD_CONTACT,
        partyRelationshipTypesList: this.props.partyRelationshipTypesList,
        closeModal: this.props.closeModal,
        afterSubmit: this.handleReSearch,
        initialValues: {
          ...this.state.selectedNOWContact.party?.address?.[0],
          ...this.state.selectedNOWContact.party,
        },
      },
      content: modalConfig.ADD_QUICK_PARTY,
    });
  };

  handleReSet = () => {
    this.props.clearAllSearchResults();
    this.setState({ selectedNOWContact: {}, selectedNOWContactIndex: "", allowSearch: false });
    this.props.setSelectedRows([]);
    this.setState({ isLoading: false });
  };

  handleSelect = (e, party) => {
    e.preventDefault();
    this.updateConfirmedContactList(this.state.selectedNOWContact.id);
    this.props.change(
      FORM.VERIFY_NOW_APPLICATION_FORM,
      `contacts[${this.state.selectedNOWContactIndex}].party_guid`,
      this.formatPartyOption(party, this.state.selectedNOWContact.id)
    );
    this.setState({ isLoading: true });
    this.handleReSet();
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
      const updatedConfirmedContact = this.state.confirmedContacts.filter(
        (id) => id !== contact.id
      );
      const updatedData = this.state.selectedData.filter(
        ({ contactID }) => contactID !== contact.id
      );
      this.setState({ confirmedContacts: updatedConfirmedContact, selectedData: updatedData });
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
    this.props.setSelectedRows([]);
    return this.props.fetchSearchResults(searchTerm, "party").then(() => {
      this.setState({ isLoading: false });
    });
  };

  handlSimpleSearch = (searchTerm) => {
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
      this.props.setSelectedRows([partyGuid, ...this.props.selectedRows]);
    }
    this.setState({ isLoading: true });
    this.props.fetchSearchResults(this.state.searchTerm, "party").then(({ data }) => {
      const subSetResults = data?.search_results?.party.filter(({ result }) =>
        this.props.selectedRows.includes(result.party_guid)
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
      this.setState({
        confirmedContacts: [],
        selectedNOWContact: {},
        selectedNOWContactIndex: "",
        allowSearch: false,
      });
    }

    if (selectedRowsChanged && this.props.searchResults?.party?.length > 0) {
      const subSetResults = this.props.searchResults?.party.filter(({ result }) =>
        nextProps.selectedRows.includes(result.party_guid)
      );
      return this.props.storeSubsetSearchResults(subSetResults);
    }
  };

  componentWillUnmount() {
    return this.props.clearAllSearchResults();
  }

  renderCoreContacts = () => {
    return (
      <Col span={8}>
        <Row className="contact-rows">
          <Col span={24} style={{ minHeight: "130px" }}>
            <h3>Contact Detail</h3>
            <p>
              Use this information to determine if this is the correct contact to use in CORE for
              this application. Click &quot;Select Contact&quot; when you have found the right
              match.
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
                          <img className="icon-sm" src={PROFILE_NOCIRCLE} alt="user" height={25} />
                          <h4>{startCase(result.name)}</h4>
                        </div>
                        <div>
                          <div className="inline-flex">
                            <div className="padding-right">
                              <MailOutlined className="icon-sm" />
                            </div>
                            {result.email && result.email !== "Unknown" ? (
                              <a href={`mailto:${result.email}`}>{result.email}</a>
                            ) : (
                              <p>{Strings.EMPTY_FIELD}</p>
                            )}
                          </div>
                          <div className="inline-flex">
                            <div className="padding-right">
                              <PhoneOutlined className="icon-sm" />
                            </div>
                            <p>{result.phone_no}</p>
                          </div>
                          <Address address={result.address[0] || {}} />
                        </div>
                      </Col>
                    </Row>
                    <div className="right center-mobile">
                      <Button
                        className="full-mobile"
                        type="secondary"
                        onClick={(e) => this.openEditPartyModal(e, result.party_guid, result.name)}
                      >
                        Update Contact
                      </Button>
                      <Button
                        className="full-mobile"
                        type="primary"
                        onClick={(e) => this.handleSelect(e, result)}
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
        </Row>
      </Col>
    );
  };

  renderSearchResults = () => {
    return (
      <Col span={8}>
        <Row className="contact-rows">
          <Col span={24} style={{ minHeight: "130px" }}>
            <h3>Matching Contact Options</h3>
            <p>
              Click on a contact(s) below to see their detailed information in the &quot;Contact
              detail&quot; column. If you cannot find a match, you can create a new contact.
            </p>
          </Col>
          {this.state.allowSearch || this.state.isLoading ? (
            <Col span={24} className="card--white">
              <AddButton
                style={{ float: "right" }}
                onClick={(e) => this.showAddPartyModal(e)}
                type="secondary"
              >
                Add New Contact
              </AddButton>
              <Input.Search
                placeholder="Search"
                allowClear
                defaultValue={this.state.searchTerm}
                onSearch={(searchTerm) => this.handlSimpleSearch(searchTerm)}
                onPressEnter={(event) => event.preventDefault()}
                size="large"
              />
              <br />
              <LoadingWrapper condition={!this.state.isLoading}>
                <Table
                  className="party-table"
                  align="left"
                  pagination={false}
                  columns={columns}
                  dataSource={transformData(this.props.searchResults.party)}
                  locale={{
                    emptyText: "No Results",
                  }}
                  rowSelection={{
                    selectedRowKeys: this.props.selectedRows,
                    onChange: (selectedRowKeys) => {
                      this.props.setSelectedRows(selectedRowKeys);
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
        </Row>
      </Col>
    );
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
          updateConfirmedList={this.updateConfirmedContactList}
          contactFormValues={this.props.contactFormValues}
          wasFormReset={this.props.wasFormReset}
          handleSearch={this.handleSearch}
          selectedContactIndex={this.state.selectedNOWContactIndex}
          selectedData={this.state.selectedData}
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
      fetchPartyById,
      updateParty,
      change,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(VerifyNoWContacts);
