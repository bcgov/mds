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
}

export interface SearchQuery {
    query: string;
    filters?: string[];
    sortBy?: string;
}

export interface SearchResultsProps {
    results: SearchResult;
}

export interface Facet {
    name: string;
    count: number;
}

export interface FacetGroup {
    title: string;
    field: string;
    options: Facet[];
}

// Add to existing SearchResult interface
export interface SearchResult {
    documents: HaystackDocumentSearchResult[];
    prompt: HaystackPromptSearchResult;
    facets?: {
        categories: Facet[];
        mines: Facet[];
        years: Facet[];
    };
}