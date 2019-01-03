import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { DefaultContact } from "@/components/mine/ContactInfo/PartyRelationships/DefaultContact";

const propTypes = {
  partyRelationship: CustomPropTypes.partyRelationship.isRequired,
  partyRelationshipTypeLabel: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  mine: PropTypes.object.isRequired,
  openEditPartyRelationshipModal: PropTypes.func.isRequired,
  onSubmitEditPartyRelationship: PropTypes.func.isRequired,
  removePartyRelationship: PropTypes.func.isRequired,
};

export const Permittee = (props) => {
  const permit = props.mine.mine_permit.find(
    (x) => x.permit_guid === props.partyRelationship.permit_guid
  );
  const permitPartyRelationshipTypeLabel = `${props.partyRelationshipTypeLabel} - PERMIT NO. ${
    permit.permit_no
  }`;

  return (
    <DefaultContact
      partyRelationship={props.partyRelationship}
      partyRelationshipTypeLabel={permitPartyRelationshipTypeLabel}
      handleChange={props.handleChange}
      mine={props.mine}
      openEditPartyRelationshipModal={props.openEditPartyRelationshipModal}
      onSubmitEditPartyRelationship={props.onSubmitEditPartyRelationship}
      removePartyRelationship={props.removePartyRelationship}
    />
  );
};

Permittee.propTypes = propTypes;

export default Permittee;
