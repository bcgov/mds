import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { formatTitleString } from "@/utils/helpers";
import { Card } from "antd";

const propTypes = {
  permit: PropTypes.objectOf(CustomPropTypes.permit),
  PartyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
};

const defaultProps = {
  permit: {},
  PartyRelationships: [],
};

export const PermitCard = (props) => {
  const { permit, PartyRelationships } = props;
  const permittees = PartyRelationships.filter((pr) =>
    ["PMT"].includes(pr.mine_party_appt_type_code)
  );
  return (
    <div>
      <h4>{formatTitleString(permit.permit_no)}</h4>
      <br />
      <h6>Last Amended</h6>
      <span>{permit.issue_date}</span>
      <br />
      <br />
      <h6>Permittee</h6>
      <span>
        {permittees.find((pmts) => pmts.related_guid.includes(permit.permit_guid)).party.name}
      </span>
      <br />
      <br />
    </div>
  );
};

PermitCard.propTypes = propTypes;
PermitCard.defaultProps = defaultProps;

export default PermitCard;
