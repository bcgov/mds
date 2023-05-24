import { IMineDocument } from "@/index";

export interface INoWImportedApplicationDocument {
  messageid: number;
  documenturl: string;
  filename: string;
  documenttype: string;
  description: string;
  is_final_package: boolean;
  final_package_order: number;
  mine_document: IMineDocument;
}
