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
}

export interface ISearchResultList {
  mine: ISearchResult<IMine>[],
  mine_documents: ISearchResult<IMineDocument>[],
  party: ISearchResult<IParty>[],
  permit: ISearchResult<IPermit>[],
  permit_documents: ISearchResult<IPermitAmendmentDocument>[],
}