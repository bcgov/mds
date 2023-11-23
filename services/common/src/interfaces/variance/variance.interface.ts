import { IMineDocument } from "../mineDocument.interface";
import { IVarianceDocument } from "./varianceDocument.interface";

export interface IVariance {
  variance_guid: string;
  variance_no?: number;
  mine_guid?: string;
  parties_notified_ind?: boolean;
  created_by?: string;
  created_timestamp?: string;
  updated_by?: string;
  updated_timestamp?: string;
  variance_document_category_code?: string;
  compliance_article_id: number;
  variance_application_status_code: string;
  applicant_guid: string;
  inspector_party_guid: string;
  expiry_date: string;
  issue_date: string;
  note: string;
  received_date: string;
  documents: Partial<IMineDocument>[] | Partial<IVarianceDocument>[];
}
