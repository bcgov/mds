// src/services/types.ts

export interface HaystackDocumentMeta {
    permit: string;
    mine_name: string;
    document_manager_guid: string;
    mine_number: string;
    issue_date: string;
    document_name: string;
    category: string;
    step_path: string;
    step: string;
}
export interface HaystackDocumentSearchResult {
    id: string;
    content: string;
    meta: HaystackDocumentMeta;
    score: number;
}

export interface HaystackPromptSearchResult {
    answers: string[];
}

export interface SearchResult {
    documents: HaystackDocumentSearchResult[];
    prompt: HaystackPromptSearchResult;
    facets?: {
        [key: string]: Facet[];
    };
    allFacets?: {
        [key: string]: Facet[];
    };
}

export enum FilterOperator {
    AND = "AND",
    OR = "OR",
    NOT = "NOT"
}

export enum ConditionOperator {
    EQUALS = "==",
    NOT_EQUALS = "!=",
    GREATER_THAN = ">",
    GREATER_THAN_OR_EQUAL = ">=",
    LESS_THAN = "<",
    LESS_THAN_OR_EQUAL = "<=",
    IN = "in",
    NOT_IN = "not in"
}

export interface IQueryFilter {
    operator: FilterOperator;
    conditions: {
        field: string;
        operator: ConditionOperator;
        value: string | string[];
    }[];
}


export interface SearchQuery {
    query: string;
    filters?: IQueryFilter;
    sortBy?: string;
}

export interface SearchResultsProps {
    results: SearchResult;
    loading?: boolean;
    setFilters: (filters: Array<{ category: string; value: string }>) => void;
    selectedFilters: Array<{ category: string; value: string }>;
}

export interface Facet {
    value: string;
    count: number;
}

export interface FacetGroup {
    title: string;
    field: string;
    options: Facet[];
}