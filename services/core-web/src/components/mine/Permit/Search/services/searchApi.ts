import axios from 'axios';
import { SearchQuery, SearchResult } from './types';
import CustomAxios from '@mds/common/redux/customAxios';
import { createRequestHeader } from '@mds/common/redux/utils/RequestHeaders';
import { ENVIRONMENT } from '@mds/common/constants/environment';

const AZURE_SEARCH_ENDPOINT = 'search/permit-conditions';

export const searchApi = async (query: SearchQuery): Promise<SearchResult> => {
    try {
        const response = await CustomAxios().post(`${ENVIRONMENT.apiUrl}/${AZURE_SEARCH_ENDPOINT}`, {
            query: query.query,
            // Add other parameters as needed
        }, createRequestHeader());

        return response.data; // Adjust based on the actual response structure
    } catch (error) {
        console.error('Error fetching search results:', error);
        throw error;
    }
};