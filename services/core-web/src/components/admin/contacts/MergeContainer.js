/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Row, Col, Card, Popconfirm, Button } from "antd";
import PropTypes from "prop-types";
import {
  fetchSearchResults,
  clearAllSearchResults,
} from "@common/actionCreators/searchActionCreator";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import RenderMultiSelectPartySearch from "@/components/common/RenderMultiSelectPartySearch";
import { storeSubsetSearchResults } from "@common/actions/searchActions";
import { getSearchResults, getSearchSubsetResults } from "@common/selectors/searchSelectors";
import { mergeParties } from "@common/actionCreators/partiesActionCreator";
import { getPartyRelationshipTypesList } from "@common/selectors/staticContentSelectors";
import { TRASHCAN, PROFILE_NOCIRCLE } from "@/constants/assets";
import Address from "@/components/common/Address";
import * as Strings from "@common/constants/strings";

const propTypes = {
  partyType: PropTypes.bool.isRequired,
};

const partyTypeLabel = {
  PER: "Person",
  ORG: "Company",
};

const transformData = (results) =>
  results &&
  results.map(({ result }) => {
    return {
      key: result.party_guid,
      name: result.name,
      ...result,
    };
  });

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

export class MergeContainer extends Component {
  state = { isLoading: false, submitting: false };

  handleSimpleSearch = (searchTerm) => {
    this.setState({ isLoading: true });
    return this.props.fetchSearchResults(searchTerm, "party").then(() => {
      this.setState({ isLoading: false });
    });
  };

  handleMergeContacts = () => {
    console.log("MERGING");
    const payload = {};
    this.setState({ isSubmitting: true, isLoading: true });
    this.props
      .mergeParties(paylod)
      .then(() => {
        this.setState({ isSubmitting: false, isLoading: false });
        this.props.clearAllSearchResults();
      })
      .catch(() => {
        this.setState({ isSubmitting: false, isLoading: false });
      });
  };

  renderContactCard = () => {
    return (
      <div className="contact-container flex-4">
        {this.props.searchSubsetResults && this.props.searchSubsetResults.length > 0 ? (
          <Row gutter={16}>
            {this.props.searchSubsetResults.map((data) => {
              return (
                <Col span={6} key={data.value}>
                  <Card className="no-header inherit-height" bordered={false}>
                    <Row>
                      <Col span={24}>
                        <div className="inline-flex">
                          <img
                            className="icon-sm padding-sm--right"
                            src={PROFILE_NOCIRCLE}
                            alt="user"
                            height={25}
                          />
                          <h4>{data.label}</h4>
                        </div>
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
              onClick={() => this.handleMergeContacts()}
              loading={this.state.submitting}
            >
              Merge Contacts
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
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(MergeContainer);
