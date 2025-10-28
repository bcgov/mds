export interface IMinespaceUser {
    user_id: number;
    email_or_username: string;
    keycloak_guid?: string;
    mines: string[];
}

export interface IMinespaceUserMine {
    mine_guid: string;
    mine_name: string;
}