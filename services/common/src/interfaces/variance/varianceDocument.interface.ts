import { IMineDocument } from "../mineDocument.interface";

export interface IVarianceDocument extends IMineDocument {
  created_at: string;
  variance_document_category_code: string;
}
