/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { isEmpty } from "lodash";
import { Row, Col, Card, Popconfirm, Button, Radio } from "antd";
import { PhoneOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import {
  fetchSearchResults,
  clearAllSearchResults,
} from "@common/actionCreators/searchActionCreator";
import RenderMultiSelectPartySearch from "@/components/common/RenderMultiSelectPartySearch";
import { storeSubsetSearchResults } from "@common/actions/searchActions";
import { getSearchResults, getSearchSubsetResults } from "@common/selectors/searchSelectors";
import {
  getPartyRelationshipTypeHash,
  getPartyRelationshipTypesList,
} from "@common/selectors/staticContentSelectors";
import { mergeParties } from "@common/actionCreators/partiesActionCreator";
import Address from "@/components/common/Address";
import * as Strings from "@common/constants/strings";
import { openModal, closeModal } from "@common/actions/modalActions";
import { modalConfig } from "@/components/modalContent/config";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

const propTypes = {
  partyType: PropTypes.bool.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const partyType = {
  PER: "Person",
  ORG: "Company",
};

export class MergeContainer extends Component {
  state = {
    isLoading: false,
    submitting: false,
    contactsForMerge: [],
    rolesForMerge: [],
    values: {
      first_name: "",
      party_name: "",
      email: "",
      phone_no: "",
      address: {},
    },
    valuesSelected: {
      first_name: "",
      party_name: "",
      email: "",
      phone_no: "",
      address: {},
    },
  };

  handleSimpleSearch = (searchTerm) => {
    this.setState({ isLoading: true });
    return this.props.fetchSearchResults(searchTerm, "party").then(() => {
      this.setState({ isLoading: false });
    });
  };

  confirmMergeModal = () => {
    this.props.openModal({
      props: {
        title: "Confirm Merge",
        closeModal: this.props.closeModal,
        initialValues: this.state.values,
        onSubmit: this.handleMergeContacts,
        isPerson: this.props.partyType === "PER",
        roles: this.state.rolesForMerge,
        partyRelationshipTypesHash: this.props.partyRelationshipTypesHash,
      },
      content: modalConfig.MERGE_PARTY_CONFIRMATION,
      width: "75vw",
    });
  };

  handleMergeContacts = (values) => {
    const payload = {
      party_guids: this.state.contactsForMerge.map(({ party_guid }) => party_guid),
      party: { ...values, party_type_code: this.props.partyType },
    };
    this.setState({ isSubmitting: true, isLoading: true });
    this.props
      .mergeParties(payload)
      .then(() => {
        this.props.clearAllSearchResults();
        this.setState({ contactsForMerge: [] });
      })
      .finally(() => {
        this.props.closeModal();
        this.setState({ isSubmitting: false, isLoading: false });
      });
  };

  componentWillReceiveProps = (nextProps) => {
    const searchSubsetChanged = this.props.searchSubsetResults !== nextProps.searchSubsetResults;
    const searchCleared =
      nextProps.searchSubsetResults.length === 0 && nextProps.searchResults.length === 0;

    if (searchSubsetChanged && !searchCleared) {
      const contacts = [];
      const roles = [];
      nextProps.searchResults?.party.map(({ result }) => {
        nextProps.searchSubsetResults?.map(({ value }) => {
          if (result.party_guid === value) {
            contacts.push(result);
            roles.push(...result.mine_party_appt);
          }
        });
      });
      this.setState({ contactsForMerge: contacts, rolesForMerge: roles });
    }
  };

  handleContactSelect = (event, field) => {
    this.setState((prevState) => ({
      values: { ...prevState.values, [field]: event.target.name },
      valuesSelected: { ...prevState.valuesSelected, [field]: event.target.value },
    }));
  };

  renderContactCards = () => {
    return (
      <div className="contact-container flex-4">
        {this.state.contactsForMerge && this.state.contactsForMerge.length > 0 ? (
          <Row gutter={6}>
            {this.state.contactsForMerge.map((data, i) => {
              console.log(data);
              return (
                <Col span={6} key={data.party_guid}>
                  <Card className="no-header inherit-height" bordered={false}>
                    <Row>
                      <Col span={24} className="grid padding-sm">
                        <h6>First Name</h6>
                        <Radio.Group
                          name={data.first_name}
                          onChange={(event) => this.handleContactSelect(event, "first_name")}
                          value={this.state.valuesSelected.first_name}
                        >
                          <Radio value={`${data.first_name}${i}`} disabled={!data.first_name}>
                            {data.first_name || Strings.EMPTY_FIELD}
                          </Radio>
                        </Radio.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24} className="grid padding-sm">
                        <h6>Last Name</h6>
                        <Radio.Group
                          name={data.party_name}
                          onChange={(event) => this.handleContactSelect(event, "party_name")}
                          value={this.state.valuesSelected.party_name}
                        >
                          <Radio value={`${data.party_name}${i}`} disabled={!data.party_name}>
                            {data.party_name || Strings.EMPTY_FIELD}
                          </Radio>
                        </Radio.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24} className="grid padding-sm">
                        <h6>Phone Number</h6>
                        <Radio.Group
                          name={data.phone_no}
                          onChange={(event) => this.handleContactSelect(event, "phone_no")}
                          value={this.state.valuesSelected.phone_no}
                        >
                          <Radio value={`${data.phone_no}${i}`} disabled={!data.phone_no}>
                            {data.phone_no || Strings.EMPTY_FIELD}
                          </Radio>
                        </Radio.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24} className="grid padding-sm">
                        <h6>Email</h6>
                        <Radio.Group
                          name={data.email}
                          onChange={(event) => this.handleContactSelect(event, "email")}
                          value={this.state.valuesSelected.email}
                        >
                          <Radio value={`${data.email}${i}`} disabled={!data.email}>
                            {data.email || Strings.EMPTY_FIELD}
                          </Radio>
                        </Radio.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24} className="grid padding-sm">
                        <h6>Address</h6>
                        <Radio.Group
                          name={data.address[0]}
                          onChange={(event) => this.handleContactSelect(event, "address")}
                          value={this.state.valuesSelected.address}
                        >
                          <Radio value={data.address[0]} disabled={isEmpty(data.address[0])}>
                            <Address address={data.address[0] || {}} showIcon={false} />
                          </Radio>
                        </Radio.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24} className="grid padding-sm">
                        <h6>Active Roles</h6>
                        {data.mine_party_appt &&
                        data.mine_party_appt.filter(({ end_date }) => !end_date).length > 0 ? (
                          data.mine_party_appt.length > 0 &&
                          data.mine_party_appt
                            .filter(({ end_date }) => !end_date)
                            .map((appt) => (
                              <p>
                                {
                                  this.props.partyRelationshipTypesHash[
                                    appt.mine_party_appt_type_code
                                  ]
                                }{" "}
                                - {appt.mine.mine_name}
                              </p>
                            ))
                        ) : (
                          <p>{Strings.EMPTY_FIELD}</p>
                        )}
                      </Col>
                    </Row>
                  </Card>
                </Col>
              );
            })}
          </Row>
        ) : (
          <Col span={24}>
            <p className="null">No Contact selected to merge</p>
          </Col>
        )}
      </div>
    );
  };

  renderContactCard = (data) => (
    <Col span={24} key={data.party_guid}>
      <Card className="no-header inherit-height" bordered={false}>
        <Row>
          <Col span={24} className="grid padding-sm">
            <h6>First Name</h6>
            <p>{data.first_name || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row>
          <Col span={24} className="grid padding-sm">
            <h6>Last Name</h6>
            <p>{data.party_name || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row>
          <Col span={24} className="grid padding-sm">
            <h6>Phone Number</h6>
            <p>
              <PhoneOutlined className="icon-sm padding-sm--right" />
              {data.phone_no || Strings.EMPTY_FIELD}
            </p>
          </Col>
        </Row>
        <Row>
          <Col span={24} className="grid padding-sm">
            <h6>Email</h6>
            <p>
              <MailOutlined className="icon-sm padding-sm--right" />
              {data.email || Strings.EMPTY_FIELD}
            </p>
          </Col>
        </Row>
        <Row>
          <Col span={24} className="grid padding-sm">
            <h6>Address</h6>
            <Address address={data.address || {}} />
          </Col>
        </Row>
        <Row>
          <Col span={24} className="grid padding-sm">
            <h6>Active Roles</h6>
            <p>
              {this.state.rolesForMerge &&
              this.state.rolesForMerge.filter(({ end_date }) => !end_date).length > 0 ? (
                this.state.rolesForMerge.length > 0 &&
                this.state.rolesForMerge
                  .filter(({ end_date }) => !end_date)
                  .map((appt) => (
                    <p>
                      {this.props.partyRelationshipTypesHash[appt.mine_party_appt_type_code]} -{" "}
                      {appt.mine.mine_name}
                    </p>
                  ))
              ) : (
                <p>{Strings.EMPTY_FIELD}</p>
              )}
            </p>
          </Col>
        </Row>
        <Row>
          <Col span={24} className="grid padding-sm">
            <h6>In-active Roles</h6>
            <p>
              {this.state.rolesForMerge &&
              this.state.rolesForMerge.filter(({ end_date }) => end_date).length > 0 ? (
                this.state.rolesForMerge.length > 0 &&
                this.state.rolesForMerge
                  .filter(({ end_date }) => end_date)
                  .map((appt) => (
                    <p>
                      {this.props.partyRelationshipTypesHash[appt.mine_party_appt_type_code]} -{" "}
                      {appt.mine.mine_name}
                    </p>
                  ))
              ) : (
                <p>{Strings.EMPTY_FIELD}</p>
              )}
            </p>
          </Col>
        </Row>
      </Card>
    </Col>
  );

  render() {
    return (
      <div className="merge-dashboard">
        <h4>Merge {partyType[this.props.partyType]}</h4>
        <br />
        <div className="search-contents inline-flex between">
          <div className="flex-1">
            <p>Search and select contacts to merge</p>
          </div>
          <div className="flex-4">
            <RenderMultiSelectPartySearch
              onSearch={this.handleSimpleSearch}
              options={this.props.searchResults.party}
              isLoading={this.state.isLoading}
            />
          </div>
          <br />
        </div>
        <br />
        <div className="merge-container">
          <div className="merge-container--tall inline-flex between">
            <div className="flex-1">
              <h4>Proposed Merged Contact</h4>
              {this.renderContactCard(this.state.values)}
            </div>
            {this.renderContactCards()}
          </div>
          <AuthorizationWrapper permission={Permission.ADMINISTRATIVE_USERS}>
            <div className="right center-mobile">
              <Popconfirm
                placement="topRight"
                title="Are you sure you want to cancel?"
                onConfirm={() => this.props.clearAllSearchResults()}
                okText="Yes"
                cancelText="No"
              >
                <Button className="full-mobile" type="secondary">
                  Clear All
                </Button>
              </Popconfirm>
              <Button
                className="full-mobile"
                type="primary"
                htmlType="submit"
                disabled={this.state.contactsForMerge.length < 2}
                onClick={() => this.confirmMergeModal()}
              >
                Proceed to Merge
              </Button>
            </div>
          </AuthorizationWrapper>
        </div>
      </div>
    );
  }
}

MergeContainer.propTypes = propTypes;

const mapStateToProps = (state) => ({
  partyRelationshipTypesList: getPartyRelationshipTypesList(state),
  searchResults: getSearchResults(state),
  searchSubsetResults: getSearchSubsetResults(state),
  partyRelationshipTypesHash: getPartyRelationshipTypeHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchSearchResults,
      clearAllSearchResults,
      storeSubsetSearchResults,
      mergeParties,
      openModal,
      closeModal,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(MergeContainer);
