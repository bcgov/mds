import React from "react";
import PropTypes from "prop-types";
import { formatTitleString, formatDate } from "@common/utils/helpers";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  permit: PropTypes.objectOf(CustomPropTypes.permit),
  PartyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
};

const defaultProps = {
  permit: {},
  PartyRelationships: [],
};

export const PermitCard = (props) => {
  const pmt = props.PartyRelationships.filter((pr) => pr.mine_party_appt_type_code === "PMT")
    .filter((pmts) => pmts.related_guid.includes(props.permit.permit_guid))
    .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0];

  return (
    <div>
      <h4>{formatTitleString(props.permit.permit_no)}</h4>
      <br />
      <h6>Last Amended</h6>
      <span>
        {props.permit.permit_amendments[0] ? (
          formatDate(props.permit.permit_amendments[0].issue_date)
        ) : (
          <i>No Amendments</i>
        )}
      </span>
      <br />
      <br />
      <h6>Permittee</h6>
      <span>{pmt ? pmt.party.name : <i>None Assigned</i>}</span>
      <br />
      <br />
    </div>
  );
};

PermitCard.propTypes = propTypes;
PermitCard.defaultProps = defaultProps;

export default PermitCard;
