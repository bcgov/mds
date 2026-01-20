import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { fetchSearchResults, fetchSearchOptions } from "@mds/common/redux/actionCreators/searchActionCreator";
import * as API from "@mds/common/constants/API";
import * as MOCK from "../mocks/dataMocks";
import * as genericActions from "@mds/common/redux/actions/genericActions";

const dispatch = jest.fn();
const requestSpy = jest.spyOn(genericActions, "request");
const successSpy = jest.spyOn(genericActions, "success");
const errorSpy = jest.spyOn(genericActions, "error");
const mockAxios = new MockAdapter(axios);

describe("searchActionCreator", () => {
  beforeEach(() => {
    mockAxios.reset();
    dispatch.mockClear();
    requestSpy.mockClear();
    successSpy.mockClear();
    errorSpy.mockClear();
  });

  describe("fetchSearchResults", () => {
    it("Request successful, dispatches success with correct response", () => {
      const searchTerm = "test";
      const searchTypes = "mine,party";

      const mockResponse = {
        search_terms: ["test"],
        search_results: MOCK.SEARCH_RESULTS_V2,
        facets: MOCK.SEARCH_FACETS,
      };

      mockAxios.onGet().reply(200, mockResponse);

      return fetchSearchResults(searchTerm, searchTypes)(dispatch).then(() => {
        expect(requestSpy).toHaveBeenCalledTimes(1);
        expect(successSpy).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalled();
      });
    });

    it("Request failure, dispatches error with correct response", () => {
      const searchTerm = "test";

      mockAxios.onGet().reply(500, { error: "Internal server error" });

      return fetchSearchResults(searchTerm)(dispatch).then(() => {
        expect(requestSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledTimes(1);
      });
    });

    it("includes search terms in request", () => {
      const searchTerm = "test mine";

      mockAxios.onGet().reply(200, {
        search_terms: ["test", "mine"],
        search_results: {},
        facets: {},
      });

      return fetchSearchResults(searchTerm)(dispatch).then(() => {
        expect(mockAxios.history.get[0].url).toContain("search_term");
        expect(requestSpy).toHaveBeenCalledTimes(1);
      });
    });

    it("handles network errors", () => {
      const searchTerm = "test";

      mockAxios.onGet().networkError();

      return fetchSearchResults(searchTerm)(dispatch).then(() => {
        expect(requestSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("fetchSearchOptions", () => {
    it("Request successful, dispatches success with correct response", () => {
      const mockOptions = MOCK.SEARCH_OPTIONS || [];

      mockAxios.onGet().reply(200, mockOptions);

      return fetchSearchOptions()(dispatch).then(() => {
        expect(requestSpy).toHaveBeenCalledTimes(1);
        expect(successSpy).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalled();
      });
    });

    it("Request failure, dispatches error with correct response", () => {
      mockAxios.onGet().reply(500, { error: "Internal server error" });

      return fetchSearchOptions()(dispatch).then(() => {
        expect(requestSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledTimes(1);
      });
    });
  });
});
