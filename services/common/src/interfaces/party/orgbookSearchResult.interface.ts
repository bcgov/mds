// Matches `OrgBookSearchResultItem` / `ORGBOOK_SEARCH_RESULT_ITEM` in
// services/core-api/app/api/services/orgbook_types.py and
// services/core-api/app/api/orgbook/response_models.py
export interface IBCRegistrationSearchResult {
    registration_id: string;
    text: string;
    credential_id: number;
}
