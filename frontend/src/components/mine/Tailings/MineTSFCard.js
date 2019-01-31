import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  tailingsStorageFacility: CustomPropTypes.tailingsStorageFacility,
  PartyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
};

const defaultProps = {
  tailingsStorageFacility: {},
  PartyRelationships: [],
};

export const TSFCard = (props) => {
  const tsf_eor = props.PartyRelationships.filter(
    (pr) => pr.related_guid === props.tailingsStorageFacility.mine_tailings_storage_facility_guid
  ).sort((a, b) => Date.parse(a.start_date) < Date.parse(b.start_date))[0];
  return (
    <div>
      <h4>{props.tailingsStorageFacility.mine_tailings_storage_facility_name}</h4>
      <br />
      <h6>Engineer Of Record</h6>
      <span>{tsf_eor ? tsf_eor.party.name : <i>None Assigned</i>}</span>
      <br />
      <br />
    </div>
  );
};

TSFCard.propTypes = propTypes;
TSFCard.defaultProps = defaultProps;

export default TSFCard;
