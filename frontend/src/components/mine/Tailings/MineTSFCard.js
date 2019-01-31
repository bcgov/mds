import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  tailings_storage_facility: CustomPropTypes.object,
  PartyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
};

const defaultProps = {
  tailings_storage_facility: {},
  PartyRelationships: [],
};

export const TSFCard = (props) => {
  const { tailingsStorageFacility, PartyRelationships } = props;
  const tsf_eor = PartyRelationships.filter(
    (pr) => pr.related_guid === tailingsStorageFacility.mine_tailings_storage_facility_guid
  ).sort((a, b) => Date.parse(a.start_date) < Date.parse(b.start_date))[0];
  return (
    <div>
      <h4>{tailingsStorageFacility.mine_tailings_storage_facility_name}</h4>
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
