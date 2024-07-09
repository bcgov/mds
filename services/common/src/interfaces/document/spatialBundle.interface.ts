import { IMineDocument } from "../mineDocument.interface";

export interface ISpatialBundle {
  bundle_id: string;
  document_name: string;
  upload_date: string;
  bundleFiles: IMineDocument[];
  geomark_id?: string;
  isSingleFile: boolean;
}
