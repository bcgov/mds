import { IParty } from "@mds/common/interfaces";

export type ProjectLeadContactType =
    | (IParty & { is_project_lead_contact: boolean })
    | {
        project_contact_guid: string;
        is_project_lead_contact: boolean;
    };