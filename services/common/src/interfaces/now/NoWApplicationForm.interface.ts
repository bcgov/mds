import { IParty } from "../party";
import { IimportedNOWApplication } from "./importedNOWApplication.interface";

export interface INoWApplicationForm extends IimportedNOWApplication {
    now_number: string;
    now_tracking_number: number;
    lead_inspector: IParty;
    issuing_inspector: IParty;
    imported_by: string;
    imported_date: string;
    previous_application_status_code: string;
    application_type: string;
    type_of_application: string;
    ats_authorization_number: number;
    ats_project_number: number;
    other_information: string;
    unreclaimed_disturbance_previous_year: string;
    disturbance_planned_reclamation: string;
    original_start_date: string;
    mine_latitude: string;
    mine_longitude: string;
    permittee: IParty;
    regional_contact: string;
    submitted_to_core_date: string;
}
