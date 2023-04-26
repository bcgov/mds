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
  otherDetails: PropTypes.objectOf(PropTypes.any).isRequired,
  isEditable: PropTypes.bool.isRequired,
  compact: PropTypes.bool.isRequired,
};

export const TSFContact = (props) => {
  const tsf = props.mine.mine_tailings_storage_facilities.find(
    ({ mine_tailings_storage_facility_guid }) =>
      mine_tailings_storage_facility_guid === props.partyRelationship.related_guid
  );
  const subtitle = `${tsf && tsf.mine_tailings_storage_facility_name}`;

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

TSFContact.propTypes = propTypes;

export default TSFContact;
