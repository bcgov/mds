export interface IMinespaceUserRole {
    mine_guid: string;
    minespace_user_role_code: string;
    is_pending: boolean;
    minespace_user_role_xref_guid?: string;
}

export interface IMinespaceUserDocument {
    document_manager_guid: string;
    document_name: string;
    upload_date?: string;
}

export interface IMinespaceUserPermittee {
    name: string;
    title: string;
    email: string;
    phone: string;
}

export interface IMinespaceUserAccessRequest {
    minespace_user_request_id?: number;
    role_requested: string;
    business_name?: string;
    permittee?: IMinespaceUserPermittee;
    submitted_timestamp?: string;
    request_status?: number; // 0 = Pending, 1 = Approved, 2 = Rejected
    access_request_text?: string;
    ministry_contact?: string;
    // Form-only fields
    mineNotInList?: boolean;
    consent_privacy?: boolean;
    consent_electronic?: boolean;
}

export interface IMinespaceUser {
    user_id: number;
    sub: string;
    email: string;
    given_name: string;
    family_name: string;
    display_name: string;
    bceid_username: string;
    identity_provider: string;
    last_logged_in: string;
    mines: string[];
    user_roles?: IMinespaceUserRole[];
    documents?: IMinespaceUserDocument[];
    delegation_letter?: IMinespaceUserDocument[];
    access_request?: IMinespaceUserAccessRequest;
}

export interface IMinespaceUserMine {
    mine_guid: string;
    mine_name: string;
    mine_no: string;
}

export interface MineSearchResultForNewUser {
    mine_guid: string;
    mine_name: string | null;
    mine_no: string;
    permit_guid: string | null;
    permit_no: string | null;
}
