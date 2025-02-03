// src/services/types.ts

export interface HaystackDocumentSearchResult {
    id: string;
    content: string;
    meta: any;
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
