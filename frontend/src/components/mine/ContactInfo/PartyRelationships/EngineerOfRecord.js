import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { DefaultContact } from "@/components/mine/ContactInfo/PartyRelationships/DefaultContact";

const propTypes = {
  partyRelationship: CustomPropTypes.partyRelationship.isRequired,
  partyRelationshipTypeLabel: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  mine: CustomPropTypes.mine.isRequired,
  openEditPartyRelationshipModal: PropTypes.func.isRequired,
  onSubmitEditPartyRelationship: PropTypes.func.isRequired,
  removePartyRelationship: PropTypes.func.isRequired,
  otherDetails: PropTypes.object,
  isEditable: PropTypes.bool.isRequired,
};

export const EngineerOfRecord = (props) => {
  const tsf = props.mine.mine_tailings_storage_facility.find(
    ({ mine_tailings_storage_facility_guid }) =>
      mine_tailings_storage_facility_guid === props.partyRelationship.related_guid
  );
  const eorPartyRelationshipTypeLabel = `${props.partyRelationshipTypeLabel} - ${tsf &&
    tsf.mine_tailings_storage_facility_name}`;

  return (
    <DefaultContact
      partyRelationship={props.partyRelationship}
      partyRelationshipTypeLabel={eorPartyRelationshipTypeLabel}
      handleChange={props.handleChange}
      mine={props.mine}
      openEditPartyRelationshipModal={props.openEditPartyRelationshipModal}
      onSubmitEditPartyRelationship={props.onSubmitEditPartyRelationship}
      removePartyRelationship={props.removePartyRelationship}
      otherDetails={props.otherDetails}
      isEditable={props.isEditable}
    />
  );
};

EngineerOfRecord.propTypes = propTypes;

export default EngineerOfRecord;
