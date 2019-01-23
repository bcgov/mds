import React from "react";
import { Row, Col, Divider } from "antd";
import NullScreen from "@/components/common/NullScreen";
import CustomPropTypes from "@/customPropTypes";
import PropTypes from "prop-types";
import { Contact } from "@/components/mine/ContactInfo/PartyRelationships/Contact";
import {
  getPartyRelationshipTypes,
  getPartyRelationships,
  getSummaryPartyRelationships,
} from "@/selectors/partiesSelectors";
import { connect } from "react-redux";
import * as String from "@/constants/strings";
import { Link } from "react-router-dom";
import * as router from "@/constants/routes";

/**
 * @class MineSummary.js contains all content located under the 'Summary' tab on the MineDashboard.
 */

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  partyRelationshipTypes: PropTypes.arrayOf(CustomPropTypes.partyRelationshipType),
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  summaryPartyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
};

const defaultProps = {
  partyRelationshipTypes: [],
  partyRelationships: [],
  summaryPartyRelationships: [],
};

const renderPartyRelationship = (mine, partyRelationship, partyRelationshipTypes) => {
  if (partyRelationshipTypes.length === 0) return <div>{String.LOADING}</div>;

  const partyRelationshipTitle = partyRelationshipTypes.find(
    ({ mine_party_appt_type_code }) =>
      mine_party_appt_type_code === partyRelationship.mine_party_appt_type_code
  ).description;

  return (
    <Col
      xs={24}
      sm={24}
      md={24}
      lg={12}
      xl={8}
      xxl={6}
      key={partyRelationship.mine_party_appt_guid}
    >
      <Contact
        mine={mine}
        partyRelationship={partyRelationship}
        partyRelationshipTitle={partyRelationshipTitle}
        compact
      />
    </Col>
  );
};

const isActive = (partyRelationship) =>
  !partyRelationship.end_date ||
  (Date.parse(partyRelationship.end_date) >= new Date() &&
    (!partyRelationship.start_date || Date.parse(partyRelationship.start_date) <= new Date()));

export const MineSummary = (props) => {
  if (props.partyRelationships.length === 0) {
    return <NullScreen type="generic" />;
  }

  return (
    <div>
      <Row gutter={16}>
        <Col span={24}>
          <h4>MAIN CONTACTS</h4>
          <Divider />
        </Col>
      </Row>
      <Row gutter={16} type="flex" justify="center">
        {props.summaryPartyRelationships
          .filter(isActive)
          .map((partyRelationship) =>
            renderPartyRelationship(props.mine, partyRelationship, props.partyRelationshipTypes)
          )}
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <div className="right">
            <Link to={router.MINE_SUMMARY.dynamicRoute(props.mine.guid, "contact-information")}>
              See All Contacts
            </Link>
          </div>
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = (state) => ({
  partyRelationships: getPartyRelationships(state),
  partyRelationshipTypes: getPartyRelationshipTypes(state),
  summaryPartyRelationships: getSummaryPartyRelationships(state),
});

MineSummary.propTypes = propTypes;
MineSummary.defaultProps = defaultProps;

export default connect(mapStateToProps)(MineSummary);
