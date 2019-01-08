import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";

import { DefaultContact } from "@/components/mine/ContactInfo/PartyRelationships/DefaultContact";
import { EngineerOfRecord } from "@/components/mine/ContactInfo/PartyRelationships/EngineerOfRecord";
import { Permittee } from "@/components/mine/ContactInfo/PartyRelationships/Permittee";

const propTypes = {
  partyRelationship: CustomPropTypes.partyRelationship.isRequired,
  partyRelationshipTypeLabel: PropTypes.string.isRequired,
  handleChange: PropTypes.func,
  mine: CustomPropTypes.mine.isRequired,
  openEditPartyRelationshipModal: PropTypes.func,
  onSubmitEditPartyRelationship: PropTypes.func,
  removePartyRelationship: PropTypes.func,
  otherDetails: PropTypes.object,
  isEditable: PropTypes.bool,
};

const doNothing = () => {};

const defaultProps = {
  handleChange: () => {
    doNothing();
  },
  openEditPartyRelationshipModal: () => {
    doNothing();
  },
  onSubmitEditPartyRelationship: () => {
    doNothing();
  },
  removePartyRelationship: () => {
    doNothing();
  },
  isEditable: false,
};

export const Contact = (props) => {
  let component;

  switch (props.partyRelationship.mine_party_appt_type_code) {
    case "EOR":
      component = (
        <EngineerOfRecord
          partyRelationship={props.partyRelationship}
          partyRelationshipTypeLabel={props.partyRelationshipTypeLabel}
          handleChange={props.handleChange}
          mine={props.mine}
          openEditPartyRelationshipModal={props.openEditPartyRelationshipModal}
          onSubmitEditPartyRelationship={props.onSubmitEditPartyRelationship}
          removePartyRelationship={props.removePartyRelationship}
          isEditable={props.isEditable}
        />
      );
      break;
    case "PMT":
      component = (
        <Permittee
          partyRelationship={props.partyRelationship}
          partyRelationshipTypeLabel={props.partyRelationshipTypeLabel}
          handleChange={props.handleChange}
          mine={props.mine}
          openEditPartyRelationshipModal={props.openEditPartyRelationshipModal}
          onSubmitEditPartyRelationship={props.onSubmitEditPartyRelationship}
          removePartyRelationship={props.removePartyRelationship}
          isEditable={props.isEditable}
        />
      );
      break;
    default:
      component = (
        <DefaultContact
          partyRelationship={props.partyRelationship}
          partyRelationshipTypeLabel={props.partyRelationshipTypeLabel}
          handleChange={props.handleChange}
          mine={props.mine}
          openEditPartyRelationshipModal={props.openEditPartyRelationshipModal}
          onSubmitEditPartyRelationship={props.onSubmitEditPartyRelationship}
          removePartyRelationship={props.removePartyRelationship}
          isEditable={props.isEditable}
        />
      );
      break;
  }
  return component;
};

Contact.propTypes = propTypes;
Contact.defaultProps = defaultProps;

export default Contact;
