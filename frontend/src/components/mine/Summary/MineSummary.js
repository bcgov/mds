import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { objectOf, arrayOf, string } from "prop-types";
import { Card } from "antd";
import { uniqBy } from "lodash";
import NullScreen from "@/components/common/NullScreen";
import CustomPropTypes from "@/customPropTypes";
import fetchPartyRelationships from "@/actionCreators/partiesActionCreator";
import PropTypes from "prop-types";

import { Contact } from "@/components/mine/ContactInfo/PartyRelationships/Contact";
/**
 * @class MineSummary.js contains all content located under the 'Summary' tab on the MineDashboard.
 */

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  permittees: objectOf(CustomPropTypes.permittee),
  permitteeIds: arrayOf(string),
  fetchPartyRelationships: PropTypes.func.isRequired,
};

const defaultProps = {
  permittees: {},
  permitteeIds: [],
};

export class MineSummary extends Component {
  fetchMineManager(mineGuid) {
    return this.props.fetchPartyRelationships(mineGuid, null, "MMG");
  }

  render() {
    return (
      <div>{/* <Contact partyrelationship={this.fetchMineManager(this.props.mine.guid)} /> */}</div>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPartyRelationships,
    },
    dispatch
  );

MineSummary.propTypes = propTypes;
MineSummary.defaultProps = defaultProps;

export default connect(mapDispatchToProps)(MineSummary);
