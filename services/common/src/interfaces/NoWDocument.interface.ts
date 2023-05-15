import { IMineDocument } from "@/interfaces/mineDocument.interface";

export interface INoWDocument {
  now_application_document_xref_guid: string;
  now_application_document_type_code: string;
  now_application_document_sub_type_code: string;
  description: string;
  is_final_package: boolean;
  final_package_order: number;
  mine_document: IMineDocument; //this will have to be changed
}
