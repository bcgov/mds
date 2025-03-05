import React, { FC, useState } from "react";
import { uniqBy } from "lodash";
import { getPartyRelationships } from "@mds/common/redux/selectors/partiesSelectors";
import AddContactFormDetails from "./AddContactFormDetails";
import { MinePartyAppointmentTypeCodeEnum } from "@mds/common/constants/enums";
import { useAppSelector } from "@mds/common/redux/rootState";
import { IMinePartyAppt } from "@mds/common/interfaces";

export interface AddContactFormProps {
  mine_party_appt_type_code: MinePartyAppointmentTypeCodeEnum;
  onSubmit: (partyData) => void;
  isModal?: boolean;
}

export const AddContactForm: FC<AddContactFormProps> = (props) => {
  const [selectedParty, setSelectedParty] = useState(null);
  const parties = useAppSelector(getPartyRelationships) as IMinePartyAppt[];

  const handleSelectChange = (party_guid: string) => {
    if (!party_guid) {
      setSelectedParty(null);
    } else {
      const partyRelationship = parties.find((p) => p.party.party_guid === party_guid);

      if (partyRelationship) {
        setSelectedParty(partyRelationship.party);
      }
    }
  };

  const contacts = uniqBy(parties || [], (partyAppt) => partyAppt.party.party_guid)
    .filter(
      ({ mine_party_appt_type_code }) =>
        !props.mine_party_appt_type_code ||
        mine_party_appt_type_code === props.mine_party_appt_type_code
    )
    .map(({ party: { name, party_guid } }) => ({
      label: name,
      value: party_guid,
    }));

  return (
    <AddContactFormDetails
      contacts={contacts}
      initialValues={selectedParty}
      handleSelectChange={handleSelectChange}
      onSubmit={props.onSubmit}
      isModal={props.isModal}
    />
  );
};

export default AddContactForm;
