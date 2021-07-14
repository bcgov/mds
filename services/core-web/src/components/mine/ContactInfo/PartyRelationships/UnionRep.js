import React from "react";
import CustomPropTypes from "@/customPropTypes";
import { DefaultContact } from "@/components/mine/ContactInfo/PartyRelationships/DefaultContact";

const propTypes = {
  partyRelationship: CustomPropTypes.partyRelationship.isRequired,
};

export const UnionRep = (props) => (
  <DefaultContact
    {...props}
    partyRelationshipSubTitle={props.partyRelationship.union_rep_company}
  />
);

UnionRep.propTypes = propTypes;

export default UnionRep;
