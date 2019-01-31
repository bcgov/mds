import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { formatTitleString } from "@/utils/helpers";

const propTypes = {
  permit: PropTypes.objectOf(CustomPropTypes.permit),
  PartyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
};

const defaultProps = {
  permit: {},
  PartyRelationships: [],
};

export const PermitCard = (props) => {
  const permittees = props.PartyRelationships.filter((pr) =>
    ["PMT"].includes(pr.mine_party_appt_type_code)
  );
  return (
    <div>
      <h4>{formatTitleString(props.permit.permit_no)}</h4>
      <br />
      <h6>Last Amended</h6>
      <span>{props.permit.issue_date}</span>
      <br />
      <br />
      <h6>Permittee</h6>
      <span>
        {permittees.find((pmts) => pmts.related_guid.includes(props.permit.permit_guid)).party.name}
      </span>
      <br />
      <br />
    </div>
  );
};

PermitCard.propTypes = propTypes;
PermitCard.defaultProps = defaultProps;

export default PermitCard;
