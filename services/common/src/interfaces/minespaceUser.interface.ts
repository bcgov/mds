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
}

export interface IMinespaceUserMine {
    mine_guid: string;
    mine_name: string;
}