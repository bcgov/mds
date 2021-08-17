/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { isEmpty } from "lodash";
import { Row, Col, Card, Popconfirm, Button, Radio } from "antd";
import PropTypes from "prop-types";
import {
  fetchSearchResults,
  clearAllSearchResults,
} from "@common/actionCreators/searchActionCreator";
import RenderMultiSelectPartySearch from "@/components/common/RenderMultiSelectPartySearch";
import { storeSubsetSearchResults } from "@common/actions/searchActions";
import { getSearchResults, getSearchSubsetResults } from "@common/selectors/searchSelectors";
import { mergeParties } from "@common/actionCreators/partiesActionCreator";
import { getPartyRelationshipTypesList } from "@common/selectors/staticContentSelectors";
import Address from "@/components/common/Address";
import * as Strings from "@common/constants/strings";
import { openModal, closeModal } from "@common/actions/modalActions";
import { modalConfig } from "@/components/modalContent/config";

const propTypes = {
  partyType: PropTypes.bool.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const partyTypeLabel = {
  PER: "Person",
  ORG: "Company",
};

export class MergeContainer extends Component {
  state = {
    isLoading: false,
    submitting: false,
    contactsForMerge: [],
    selectedName: "",
    values: {
      first_name: "",
      party_name: "",
      email: "",
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
      },
      content: modalConfig.MERGE_PARTY_CONFIRMATION,
    });
  };

  handleMergeContacts = (values) => {
    const guids = this.state.contactsForMerge.map(({ party_guid }) => party_guid);
    const payload = {
      party_guids: guids,
      party: { ...values, party_type_code: this.props.partyType },
    };
    this.setState({ isSubmitting: true, isLoading: true });
    this.props
      .mergeParties(payload)
      .then(() => {
        this.setState({ isSubmitting: false, isLoading: false });
        this.props.clearAllSearchResults();
      })
      .catch(() => {
        this.setState({ isSubmitting: false, isLoading: false });
      })
      .finally(() => {
        this.props.closeModal();
      });
  };

  componentWillReceiveProps = (nextProps) => {
    const searchSubsetChanged = this.props.searchSubsetResults !== nextProps.searchSubsetResults;

    if (searchSubsetChanged) {
      const contacts = [];
      nextProps.searchResults?.party.map(({ result }) => {
        nextProps.searchSubsetResults?.map(({ value }) => {
          if (result.party_guid === value) {
            contacts.push(result);
          }
        });
      });
      this.setState({ contactsForMerge: contacts });
    }
  };

  handleContactSelect = (event, field) => {
    this.setState((prevState) => ({
      values: { ...prevState.values, [field]: event.target.value },
    }));
  };

  renderContactCard = () => {
    return (
      <div className="contact-container flex-4">
        {this.state.contactsForMerge && this.state.contactsForMerge.length > 0 ? (
          <Row gutter={16}>
            {this.state.contactsForMerge.map((data) => {
              return (
                <Col span={6} key={data.party_guid}>
                  <Card className="no-header inherit-height" bordered={false}>
                    <Row>
                      <Col span={24}>
                        <Radio.Group
                          name="first_name"
                          onChange={(event) => this.handleContactSelect(event, "first_name")}
                          value={this.state.values.first_name}
                        >
                          <Radio value={data.first_name} disabled={!data.first_name}>
                            {data.first_name || Strings.EMPTY_FIELD}
                          </Radio>
                        </Radio.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24}>
                        <Radio.Group
                          name="party_name"
                          onChange={(event) => this.handleContactSelect(event, "party_name")}
                          value={this.state.values.party_name}
                        >
                          <Radio value={data.party_name} disabled={!data.party_name}>
                            {data.party_name || Strings.EMPTY_FIELD}
                          </Radio>
                        </Radio.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24}>
                        <Radio.Group
                          name="phone_no"
                          onChange={(event) => this.handleContactSelect(event, "phone_no")}
                          value={this.state.values.phone_no}
                        >
                          <Radio value={data.phone_no} disabled={!data.phone_no}>
                            {data.phone_no || Strings.EMPTY_FIELD}
                          </Radio>
                        </Radio.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24}>
                        <Radio.Group
                          name="email"
                          onChange={(event) => this.handleContactSelect(event, "email")}
                          value={this.state.values.email}
                        >
                          <Radio value={data.email} disabled={!data.email}>
                            {data.email || Strings.EMPTY_FIELD}
                          </Radio>
                        </Radio.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24}>
                        <Radio.Group
                          name="email"
                          onChange={(event) => this.handleContactSelect(event, "address")}
                          value={this.state.values.address}
                        >
                          <Radio value={data.address[0]} disabled={isEmpty(data.address[0])}>
                            <Address address={data.address[0] || {}} showIcon={false} />
                          </Radio>
                        </Radio.Group>
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

  render() {
    console.log(this.state.values);
    return (
      <div className="merge-dashboard">
        <h4>Merge {partyTypeLabel[this.props.partyType]}</h4>
        <br />
        <div className="search-contents inline-flex between">
          <div className="flex-1">
            <p>Search and select contacts to merge (Max 4)</p>
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
            <div className="flex-1">Contacts</div>
            {this.renderContactCard()}
          </div>
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
              onClick={() => this.confirmMergeModal()}
              // loading={this.state.submitting}
            >
              Proceed to Merge
            </Button>
          </div>
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
