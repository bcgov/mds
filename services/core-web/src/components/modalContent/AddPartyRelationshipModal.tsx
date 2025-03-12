import React, { FC } from "react";
import AddPartyRelationshipForm, { AddPartyRelationshipFormProps } from "@/components/Forms/PartyRelationships/AddPartyRelationshipForm";


export const AddPartyRelationshipModal: FC<AddPartyRelationshipFormProps> = (props) => (
  <div>
    <AddPartyRelationshipForm
      {...props}
    />
  </div>
);


export default AddPartyRelationshipModal;
