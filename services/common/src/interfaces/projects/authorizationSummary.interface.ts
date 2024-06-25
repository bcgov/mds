import { AMS_SUBMISSION_STATUS } from "../..";

export interface IAuthorizationSummaryColumn {
  type: string;
  permit_no: string;
  ams_tracking_number?: string;
  status?: AMS_SUBMISSION_STATUS;
}
