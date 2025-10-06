import { IMineDocument } from "../mineDocument.interface";

export interface IAmsFinalApplicationDocumentType {
    ams_final_application_document_type_code: string;
    description: string;
    active_ind: boolean;
}

export interface IAmsFinalApplicationDocument extends IMineDocument {
    ams_final_application_document_xref_guid: string;
    ams_final_application_guid: string;
    ams_final_application_document_type_code: string;
    document_type_description: string;
}

export interface IAmsFinalApplication {
    ams_final_application_guid: string;
    project_summary_authorization_guid: string;
    project_summary_guid: string;
    submitter_name: string;
    is_agent: boolean;
    is_draft: boolean;
    pre_submitted_files: string[];
    submitted_timestamp?: string | null;
    documents: IAmsFinalApplicationDocument[];
    editable: boolean;
}