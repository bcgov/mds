import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { DefaultContact } from "@/components/mine/ContactInfo/PartyRelationships/DefaultContact";
import { TSFContact } from "@/components/mine/ContactInfo/PartyRelationships/TSFContact";
import { Permittee } from "@/components/mine/ContactInfo/PartyRelationships/Permittee";
import { UnionRep } from "@/components/mine/ContactInfo/PartyRelationships/UnionRep";

const propTypes = {
  partyRelationship: CustomPropTypes.partyRelationship.isRequired,
  partyRelationshipTitle: PropTypes.string.isRequired,
  handleChange: PropTypes.func,
  mine: CustomPropTypes.mine.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  openEditPartyRelationshipModal: PropTypes.func,
  onSubmitEditPartyRelationship: PropTypes.func,
  removePartyRelationship: PropTypes.func,
  otherDetails: PropTypes.objectOf(PropTypes.any),
  isEditable: PropTypes.bool,
  compact: PropTypes.bool,
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
  compact: false,
};

export const Contact = (props) => {
  let component;

  switch (props.partyRelationship.mine_party_appt_type_code) {
    case "TQP":
    case "EOR":
      component = <TSFContact {...props} />;
      break;
    case "URP":
      component = <UnionRep {...props} />;
      break;
    case "PMT":
    case "THD":
    case "LDO":
    case "MOR":
      component = <Permittee {...props} />;
      break;
    default:
      component = <DefaultContact {...props} />;
      break;
  }
  return component;
};

Contact.propTypes = propTypes;
Contact.defaultProps = defaultProps;

export default Contact;
