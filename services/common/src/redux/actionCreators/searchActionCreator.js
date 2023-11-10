import { showLoading, hideLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common";
import { request, success, error, clear } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as searchActions from "../actions/searchActions";
import * as API from "../constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

export const fetchSearchResults = (searchTerm, searchTypes) => (dispatch) => {
  dispatch(request(reducerTypes.GET_SEARCH_RESULTS));
  dispatch(showLoading());
  return CustomAxios()
    .get(
      ENVIRONMENT.apiUrl + API.SEARCH({ search_term: searchTerm, search_types: searchTypes }),
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_SEARCH_RESULTS));
      dispatch(searchActions.storeSearchResults(response.data));
      dispatch(hideLoading());
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.GET_SEARCH_RESULTS));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};

export const fetchSearchBarResults = (searchTerm) => (dispatch) => {
  dispatch(request(reducerTypes.GET_SEARCH_BAR_RESULTS));
  dispatch(showLoading());
  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl + API.SIMPLE_SEARCH}?search_term=${searchTerm}`,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_SEARCH_BAR_RESULTS));
      dispatch(searchActions.storeSearchBarResults(response.data));
      dispatch(hideLoading());
    })
    .catch(() => dispatch(error(reducerTypes.GET_SEARCH_BAR_RESULTS)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchSearchOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_SEARCH_OPTIONS));
  dispatch(showLoading());
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.SEARCH_OPTIONS, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_SEARCH_OPTIONS));
      dispatch(searchActions.storeSearchOptions(response.data));
      dispatch(hideLoading());
    })
    .catch(() => dispatch(error(reducerTypes.GET_SEARCH_OPTIONS)))
    .finally(() => dispatch(hideLoading()));
};

export const clearSearchBarResults = () => (dispatch) => {
  dispatch(clear(reducerTypes.CLEAR_SEARCH_BAR_RESULTS));
  dispatch(searchActions.clearSearchBarResults());
  dispatch(success(reducerTypes.CLEAR_SEARCH_BAR_RESULTS));
};

export const clearAllSearchResults = () => (dispatch) => {
  dispatch(clear(reducerTypes.CLEAR_ALL_SEARCH_RESULTS));
  dispatch(searchActions.clearAllSearchResults());
  dispatch(success(reducerTypes.CLEAR_ALL_SEARCH_RESULTS));
};
