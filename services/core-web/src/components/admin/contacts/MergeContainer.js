/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { isEmpty } from "lodash";
import { Prompt } from "react-router-dom";
import { Row, Col, Card, Popconfirm, Button, Radio, Tabs, Alert } from "antd";
import { PhoneOutlined, MailOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { clearAllSearchResults } from "@common/actionCreators/searchActionCreator";
import RenderMultiSelectPartySearch from "@/components/common/RenderMultiSelectPartySearch";
import NullScreen from "@/components/common/NullScreen";
import {
  getPartyRelationshipTypeHash,
  getPartyRelationshipTypesList,
} from "@common/selectors/staticContentSelectors";
import { mergeParties } from "@common/actionCreators/partiesActionCreator";
import Address from "@/components/common/Address";
import * as Strings from "@common/constants/strings";
import * as routes from "@/constants/routes";
import { openModal, closeModal } from "@common/actions/modalActions";
import { modalConfig } from "@/components/modalContent/config";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";

const propTypes = {
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

// TODO: We can get these instead by using a static content selector?
const partyType = {
  PER: "Person",
  ORG: "Company",
};

const codeFromURL = {
  Person: "PER",
  Company: "ORG",
};

export class MergeContainer extends Component {
  state = {
    activeTab: "PER",
    expanded: false,
    selectedPartySearchResults: [],
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

  componentDidMount() {
    const { tab } = this.props.match.params;
    this.setState({
      activeTab: codeFromURL[tab],
    });
  }

  handleTabChange = (key) => {
    this.props.history.replace(routes.ADMIN_CONTACT_MANAGEMENT.dynamicRoute(partyType[key]));
  };

  confirmMergeModal = () => {
    this.props.openModal({
      props: {
        title: "Confirm Merge",
        closeModal: this.props.closeModal,
        initialValues: this.state.values,
        onSubmit: this.handleMergeContacts,
        isPerson: this.state.activeTab === "PER",
        roles: this.state.rolesForMerge,
        partyRelationshipTypesHash: this.props.partyRelationshipTypesHash,
      },
      content: modalConfig.MERGE_PARTY_CONFIRMATION,
      width: "75vw",
    });
  };

  setExpanded = () => {
    this.setState((prevState) => ({
      expanded: !prevState.expanded,
    }));
  };

  handleClearState = () => {
    this.setState({
      contactsForMerge: [],
      values: {},
      valuesSelected: {},
      rolesForMerge: [],
      selectedPartySearchResults: [],
    });
  };

  onSelectedPartySearchResultsChanged = (selectedPartySearchResults) =>
    this.setState({ selectedPartySearchResults });

  handleMergeContacts = (values) => {
    const payload = {
      party_guids: this.state.contactsForMerge.map(({ party_guid }) => party_guid),
      party: { ...values, party_type_code: this.state.activeTab },
    };
    this.setState({ isSubmitting: true, isLoading: true });
    this.props
      .mergeParties(payload)
      .then(() => {
        this.handleClearState();
      })
      .finally(() => {
        this.props.closeModal();
        this.setState({ isSubmitting: false, isLoading: false });
      });
  };

  shouldComponentUpdate = (nextProps, nextState) => {
    const searchSubsetChanged =
      this.state.selectedPartySearchResults !== nextState.selectedPartySearchResults;

    const tabChanged = this.props.match.params.tab !== nextProps.match.params.tab;
    if (tabChanged) {
      this.setState({
        activeTab: codeFromURL[nextProps.match.params.tab],
      });
      this.handleClearState();
    }

    if (searchSubsetChanged) {
      const contacts = [];
      const roles = [];
      nextState.selectedPartySearchResults?.map((party) => {
        contacts.push(party);
        roles.push(...party?.mine_party_appt);
      });
      this.setState({ contactsForMerge: contacts, rolesForMerge: roles });
    }

    return true;
  };

  handleContactSelect = (event, field) => {
    this.setState((prevState) => ({
      values: { ...prevState.values, [field]: event.target.name },
      valuesSelected: { ...prevState.valuesSelected, [field]: event.target.value },
    }));
  };

  renderContactCards = () => {
    console.log(this.state.selectedPartySearchResults);
    return (
      <div className="contact-container flex-4">
        {this.state.contactsForMerge?.length > 0 ? (
          <Row gutter={6}>
            {this.state.contactsForMerge.map((data, i) => {
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
                        {data?.mine_party_appt?.filter(({ end_date }) => !end_date)?.length > 0 ? (
                          data.mine_party_appt?.length > 0 &&
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
          <NullScreen type="merged-contacts" />
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
              {this.state.rolesForMerge?.filter(({ end_date }) => !end_date)?.length > 0 ? (
                this.state.rolesForMerge?.length > 0 &&
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
              {this.state.rolesForMerge?.filter(({ end_date }) => end_date)?.length > 0 ? (
                this.state.rolesForMerge?.length > 0 &&
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

  renderMergeContainer = () => (
    <>
      <div className="merge-dashboard">
        <h4 className="padding-sm">Merge {partyType[this.state.activeTab]}</h4>
        <Alert
          message="The following parties cannot be merged at this time:"
          description={
            <>
              These parties will be disabled in the dropdown list.
              <div className={this.state.expanded ? "block" : "hidden"}>
                <ol>
                  <li>Parties with the role Permittee.</li>
                  <li>Parties with the role of Inspector.</li>
                  <li>Organizations connected to Orgbook</li>
                </ol>
              </div>
              <Button className="btn--expand" onClick={() => this.setExpanded()}>
                {this.state.expanded ? "  Read less" : "  ...Read more"}
              </Button>
            </>
          }
          type="info"
          showIcon
        />
        <br />
        <div className="search-contents inline-flex between">
          <div className="flex-1 padding-sm">
            <p>Search and select contacts to merge</p>
          </div>
          <div className="flex-4">
            <RenderMultiSelectPartySearch
              onSelectedPartySearchResultsChanged={this.onSelectedPartySearchResultsChanged}
              isLoading={this.state.isLoading}
              partyType={this.state.activeTab}
            />
          </div>
          <br />
        </div>
        <br />
        <div className="merge-container">
          <div className="merge-container--tall inline-flex between">
            <div className="flex-1">
              <h4 className="padding-sm">Proposed Merged Contact</h4>
              {this.renderContactCard(this.state.values)}
            </div>
            {this.renderContactCards()}
          </div>
          <AuthorizationWrapper permission={Permission.ADMINISTRATIVE_USERS}>
            <div className="right center-mobile">
              <Popconfirm
                placement="topRight"
                title="Are you sure you want to cancel?"
                onConfirm={() => this.handleClearState()}
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
                disabled={this.state.contactsForMerge?.length < 2}
                onClick={() => this.confirmMergeModal()}
              >
                Proceed to Merge
              </Button>
            </div>
          </AuthorizationWrapper>
        </div>
      </div>
    </>
  );

  render() {
    return (
      <div>
        <Prompt
          when={this.state.contactsForMerge.length > 0}
          message={(location, action) => {
            return this.props.location.pathname === location.pathname
              ? true
              : "Merge in progress. Are you sure you want to leave without saving? All progress will be lost.";
          }}
        />
        <div className="landing-page__header">
          <Row>
            <Col sm={22} md={14} lg={12}>
              <h1>Merge Contacts</h1>
            </Col>
          </Row>
          <Tabs
            activeKey={this.state.activeTab}
            size="large"
            animated={{ inkBar: false, tabPane: false }}
            onTabClick={this.handleTabChange}
            centered
          >
            <Tabs.TabPane tab="Merge Person" key="PER">
              <div className="tab__content">{this.renderMergeContainer()}</div>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Merge Companies" key="ORG">
              <div className="tab__content">{this.renderMergeContainer()}</div>
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
    );
  }
}

MergeContainer.propTypes = propTypes;

const mapStateToProps = (state) => ({
  partyRelationshipTypesList: getPartyRelationshipTypesList(state),
  partyRelationshipTypesHash: getPartyRelationshipTypeHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      clearAllSearchResults,
      mergeParties,
      openModal,
      closeModal,
    },
    dispatch
  );

export default AuthorizationGuard(Permission.ADMINISTRATIVE_USERS)(
  connect(mapStateToProps, mapDispatchToProps)(MergeContainer)
);
