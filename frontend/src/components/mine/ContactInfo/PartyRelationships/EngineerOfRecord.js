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

export const EngineerOfRecord = (props) => {
  const eorPartyRelationshipTypeLabel = `${props.partyRelationshipTypeLabel} - ${
    props.mine.mine_tailings_storage_facility.find(
      (x) => x.mine_tailings_storage_facility_guid === props.partyRelationship.related_guid
    ).mine_tailings_storage_facility_name
  }`;

  return (
    <DefaultContact
      partyRelationship={props.partyRelationship}
      partyRelationshipTypeLabel={eorPartyRelationshipTypeLabel}
      handleChange={props.handleChange}
      mine={props.mine}
      openEditPartyRelationshipModal={props.openEditPartyRelationshipModal}
      onSubmitEditPartyRelationship={props.onSubmitEditPartyRelationship}
      removePartyRelationship={props.removePartyRelationship}
    />
  );
};

EngineerOfRecord.propTypes = propTypes;

export default EngineerOfRecord;
