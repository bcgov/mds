import { IProjectSummaryEnvironmentAuthorizationDocument } from "./projectSummaryEnvironmentAuthorizationDocument";

export interface IProjectSummaryEnvironmentAuthorizationStatus {
    ams_tracking_number: string;
    ams_mining_permit_number: string;
    ams_authorization_number: string;
    status: string;
    regional_case_manager: string;
    documents: IProjectSummaryEnvironmentAuthorizationDocument[];
    errors: string[];
}