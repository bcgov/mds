import { IExplosivesPermit } from "./";

export interface IExplosivesPermitAmendment extends IExplosivesPermit {
  explosives_permit_amendment_id: number;
  explosives_permit_amendment_guid: string;
}
