import React, { FC } from "react";
import { IPartyAppt, ITailingsStorageFacility } from "@mds/common";

interface TSFCardProps {
  tailingsStorageFacility: ITailingsStorageFacility;
  PartyRelationships: IPartyAppt[];
}

export const TSFCard: FC<TSFCardProps> = (props) => {
  const tsf_eor = props.PartyRelationships.filter(
    (pr) =>
      pr.related_guid === props.tailingsStorageFacility.mine_tailings_storage_facility_guid &&
      pr.mine_party_appt_type_code === "EOR"
  ).sort((a, b) => Date.parse(a.start_date) - Date.parse(b.start_date))[0];
  return (
    <div>
      <h4>{props.tailingsStorageFacility.mine_tailings_storage_facility_name}</h4>
      <br />
      <h6>Engineer Of Record</h6>
      <span>{tsf_eor ? tsf_eor.party.name : <i>None Assigned</i>}</span>
      <br />
      <br />
    </div>
  );
};

export default TSFCard;
