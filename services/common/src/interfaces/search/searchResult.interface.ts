import { IDocument } from "../document";
import { IMine } from "../mine.interface";
import { IMineDocument } from "../mineDocument.interface";
import { IParty } from "../party";
import { IPermit, IPermitAmendmentDocument } from "../permits";

export interface ISearchResult<T> {
  result: T;
  score: number;
  type: string;
}

export interface ISimpleSearchResult {
  id: string;
  value: string;
  description?: string;
  highlight?: string;
  mine_guid?: string;
}

export interface IExplosivesPermitSearchResult {
  explosives_permit_guid: string;
  explosives_permit_id: string;
  application_number: string;
  application_status: string;
  mine_guid: string;
  mine_name: string;
  is_closed: boolean;
}

export interface INowApplicationSearchResult {
  now_application_guid: string;
  now_number: string;
  mine_guid: string;
  mine_name: string;
  now_application_status_code: string;
  notice_of_work_type_code: string;
}

export interface INodSearchResult {
  nod_guid: string;
  nod_no: string;
  nod_title: string;
  mine_guid: string;
  mine_name: string;
  nod_type: string;
  nod_status: string;
}

export interface ISearchResultList {
  mine: ISearchResult<IMine>[],
  mine_documents: ISearchResult<IMineDocument>[],
  party: ISearchResult<IParty>[],
  permit: ISearchResult<IPermit>[],
  permit_documents: ISearchResult<IPermitAmendmentDocument>[],
  explosives_permit: ISearchResult<IExplosivesPermitSearchResult>[],
  now_application: ISearchResult<INowApplicationSearchResult>[],
  notice_of_departure: ISearchResult<INodSearchResult>[],
}