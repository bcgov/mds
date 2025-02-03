// src/utils/helpers.ts

export const formatSearchResult = (result: any) => {
    // Format the search result for display
    return {
        title: result.title || 'No Title',
        snippet: result.snippet || 'No Snippet Available',
        source: result.source || 'Unknown Source',
    };
};

export const handleError = (error: any) => {
    // Handle errors from API calls
    console.error('An error occurred:', error);
    return 'An error occurred while fetching results. Please try again.';
};