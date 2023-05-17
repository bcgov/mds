import { IDocument } from "@/interfaces";

export interface IMineReportSubmission {
  recieved_date: string;
  documents: IDocument[];
}
