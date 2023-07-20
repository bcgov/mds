import { IMineDocument } from "@/index";

export interface IIRTDocument extends IMineDocument {
  irt_id: number;
  information_requirements_table_document_type_code: string;
}
