import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { objectOf, arrayOf, string } from "prop-types";
import { Row, Col } from "antd";
import { uniqBy } from "lodash";
import NullScreen from "@/components/common/NullScreen";
import CustomPropTypes from "@/customPropTypes";
import {
  fetchPartyRelationshipTypes,
  fetchPartyRelationships,
} from "@/actionCreators/partiesActionCreator";
import PropTypes from "prop-types";
import { getPartyRelationshipTypes, getPartyRelationships } from "@/selectors/partiesSelectors";

import { Contact } from "@/components/mine/ContactInfo/PartyRelationships/Contact";
/**
 * @class MineSummary.js contains all content located under the 'Summary' tab on the MineDashboard.
 */

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  fetchPartyRelationshipTypes: PropTypes.func.isRequired,
  fetchPartyRelationships: PropTypes.func.isRequired,
  partyRelationshipTypes: PropTypes.arrayOf(PropTypes.object),
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
};

const defaultProps = {
  partyRelationshipTypes: [],
  partyRelationships: [],
};

export class MineSummary extends Component {
  componentWillMount() {
    this.props.fetchPartyRelationshipTypes();
    this.props.fetchPartyRelationships(this.props.mine.id, null, "MMG");
  }
  /* 
  componentDidUpdate(prevProps) {
    if (prevProps.partyRelationships !== this.props.partyRelationships) {
      this.props.fetchPartyRelationships(this.props.mine.id, null, "MMG");
    }
  } */

  renderPartyRelationship(partyRelationship) {
    if (!this.props.partyRelationshipTypes.length > 0) return <div>Loading...</div>;

    const partyRelationshipTypeLabel = this.props.partyRelationshipTypes.find(
      (x) => x.mine_party_appt_type_code === partyRelationship.mine_party_appt_type_code
    ).description;

    return (
      <Col span={12} key={partyRelationship.mine_party_appt_guid}>
        <Contact
          mine={this.props.mine}
          partyRelationship={partyRelationship}
          partyRelationshipTypeLabel={partyRelationshipTypeLabel}
        />
      </Col>
    );
  }

  render() {
    return (
      <div>
        <Row gutter={16}>
          {this.props.partyRelationships
            .filter(
              (x) =>
                x.end_date === "None" ||
                (Date.parse(x.end_date) >= new Date() &&
                  (x.start_date === "None" || Date.parse(x.start_date) <= new Date()))
            )
            .map((partyRelationship) => this.renderPartyRelationship(partyRelationship))}
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  partyRelationships: getPartyRelationships(state),
  partyRelationshipTypes: getPartyRelationshipTypes(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPartyRelationships,
      fetchPartyRelationshipTypes,
    },
    dispatch
  );

MineSummary.propTypes = propTypes;
MineSummary.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineSummary);
