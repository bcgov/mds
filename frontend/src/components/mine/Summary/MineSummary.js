import React from "react";
import { arrayOf } from "prop-types";
import { Row, Col } from "antd";
import NullScreen from "@/components/common/NullScreen";
import CustomPropTypes from "@/customPropTypes";
import PropTypes from "prop-types";
import { Contact } from "@/components/mine/ContactInfo/PartyRelationships/Contact";
import {
  getPartyRelationshipTypes,
  getPartyRelationships,
  getPartyRelationshipsByTypes,
} from "@/selectors/partiesSelectors";
import { connect } from "react-redux";

/**
 * @class MineSummary.js contains all content located under the 'Summary' tab on the MineDashboard.
 */

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  partyRelationshipTypes: PropTypes.arrayOf(PropTypes.object),
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  summaryPartyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
};

const defaultProps = {
  partyRelationshipTypes: [],
  partyRelationships: [],
  summaryPartyRelationships: [],
};

const renderPartyRelationship = (mine, partyRelationship, partyRelationshipTypes) => {
  if (partyRelationshipTypes.length === 0) return <div>Loading...</div>;

  const partyRelationshipTypeLabel = partyRelationshipTypes.find(
    (x) => x.mine_party_appt_type_code === partyRelationship.mine_party_appt_type_code
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
        partyRelationshipTypeLabel={partyRelationshipTypeLabel}
      />
    </Col>
  );
};

export const MineSummary = (props) => {
  if (props.partyRelationships.length === 0) {
    return <NullScreen type="generic" />;
  }

  return (
    <div>
      <Row gutter={16} type="flex" justify="center">
        {props.summaryPartyRelationships
          .filter(
            (x) =>
              x.end_date === "None" ||
              (Date.parse(x.end_date) >= new Date() &&
                (x.start_date === "None" || Date.parse(x.start_date) <= new Date()))
          )
          .map((partyRelationship) =>
            renderPartyRelationship(props.mine, partyRelationship, props.partyRelationshipTypes)
          )}
      </Row>
    </div>
  );
};

const mapStateToProps = (state) => ({
  partyRelationships: getPartyRelationships(state),
  partyRelationshipTypes: getPartyRelationshipTypes(state),
  summaryPartyRelationships: getPartyRelationshipsByTypes(state),
});

MineSummary.propTypes = propTypes;
MineSummary.defaultProps = defaultProps;

export default connect(mapStateToProps)(MineSummary);
