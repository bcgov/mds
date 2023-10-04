import { IDocument } from "@mds/common/interfaces";

export interface IMineReportSubmission {
  recieved_date: string;
  documents: IDocument[];
}
