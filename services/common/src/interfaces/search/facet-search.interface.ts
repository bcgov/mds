export interface HaystackDocumentMeta {
    permit: string;
    permit_guid: string;
    permit_type: string;
    mine_name: string;
    mine_guid: string;
    mine_number: string;
    document_manager_guid: string;
    permit_amendment_guid: string;
    issue_date: string;
    document_name: string;
    category: string;
    step_path: string;
    step: string;
    highlights: {
        [field: string]: string[];
    }
    context: {
        parent_contexts?: ParentContext;
        sibling_contexts?: SiblingContexts;
        child_contexts?: ContextItem[];
    }
    tenure: string[];
    verification_status: string;
    artifact_presigned_url: string
}

export interface ContextItem {
    id: string;
    content: string;
    step: string;
    hierarchy: string;
}

export interface ParentContext {
    [level: string]: ContextItem;
}

export interface SiblingContexts {
    previous: ContextItem[];
    next: ContextItem[];
}

export interface HaystackDocumentSearchResult {
    id: string;
    content: string;
    meta: HaystackDocumentMeta;
    score: number;
}

export interface NowDocumentMeta {
    now_application_guid: string;
    mine_guid: string;
    document_manager_guid: string;
    document_name: string;
    document_type: string;
    artifact_type?: string;
    artifact_id?: string;
    artifact_page_number?: number;
    artifact_table_markdown?: string;
    artifact_presigned_url?: string;
    submitted_date: string | null;
    highlights?: {
        content?: string[];
    };
}

export interface NowDocumentSearchResult {
    id: string;
    content: string;
    meta: NowDocumentMeta;
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
    meta?: any;
}

export interface FacetGroup {
    title: string;
    field: string;
    options: Facet[];
}

export interface SelectedFilters {
    [key: string]: string[];
}
export interface HaystackSearchResponse extends SearchResult {
    total?: number;
    query?: string;
    page?: number;
    size?: number;
}