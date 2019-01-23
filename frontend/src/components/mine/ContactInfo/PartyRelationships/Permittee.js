import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { DefaultContact } from "@/components/mine/ContactInfo/PartyRelationships/DefaultContact";

const propTypes = {
  partyRelationship: CustomPropTypes.partyRelationship.isRequired,
  partyRelationshipTitle: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  mine: CustomPropTypes.mine.isRequired,
  openEditPartyRelationshipModal: PropTypes.func.isRequired,
  onSubmitEditPartyRelationship: PropTypes.func.isRequired,
  removePartyRelationship: PropTypes.func.isRequired,
  otherDetails: PropTypes.object,
  isEditable: PropTypes.bool.isRequired,
  compact: PropTypes.bool.isRequired,
};

export const Permittee = (props) => {
  const permit = props.mine.mine_permit.find(
    ({ permit_guid }) => permit_guid === props.partyRelationship.related_guid
  );
  const subtitle = `${permit && permit.permit_no}`;

  return (
    <DefaultContact
      partyRelationship={props.partyRelationship}
      partyRelationshipTitle={props.partyRelationshipTitle}
      partyRelationshipSubTitle={subtitle}
      handleChange={props.handleChange}
      mine={props.mine}
      openEditPartyRelationshipModal={props.openEditPartyRelationshipModal}
      onSubmitEditPartyRelationship={props.onSubmitEditPartyRelationship}
      removePartyRelationship={props.removePartyRelationship}
      otherDetails={props.otherDetails}
      isEditable={props.isEditable}
      compact={props.compact}
    />
  );
};

Permittee.propTypes = propTypes;

export default Permittee;
