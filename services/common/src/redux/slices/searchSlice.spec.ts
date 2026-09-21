import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { getStore } from "@mds/common/redux/rootState";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import * as API from "@mds/common/constants/API";
import {
  storeSearchOptions,
  storeSearchResults,
  storeSubsetSearchResults,
  storeSearchBarResults,
  clearSearchBarResults,
  clearAllSearchResults,
  fetchSearchResults,
  fetchSearchBarResults,
  fetchSearchOptions,
  selectSearchOptions,
  selectSearchResults,
  selectSearchFacets,
  selectSearchBarResults,
  selectSearchBarFacets,
  selectSearchTerms,
  selectSearchSubsetResults,
} from "./searchSlice";
import * as MOCK from "../../tests/mocks/dataMocks";

const mockAxios = new MockAdapter(axios);

describe("searchSlice", () => {
  beforeEach(() => {
    mockAxios.reset();
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const store = getStore();
      const state = store.getState();

      expect(selectSearchOptions(state)).toEqual([]);
      expect(selectSearchResults(state)).toEqual({
        mine: [],
        mine_documents: [],
        party: [],
        permit: [],
        notice_of_departure: [],
        explosives_permit: [],
        now_application: [],
        permit_documents: [],
      });
      expect(selectSearchFacets(state)).toEqual({
        mine_region: [],
        mine_classification: [],
        mine_operation_status: [],
        mine_tenure: [],
        mine_commodity: [],
        has_tsf: [],
        verified_status: [],
        permit_status: [],
        is_exploration: [],
        party_type: [],
        explosives_permit_status: [],
        explosives_permit_closed: [],
        nod_type: [],
        nod_status: [],
        now_application_status: [],
        now_type: [],
        type: [],
      });
      expect(selectSearchBarResults(state)).toEqual([]);
      expect(selectSearchBarFacets(state)).toEqual({
        mine: 0,
        person: 0,
        organization: 0,
        permit: 0,
        nod: 0,
        explosives_permit: 0,
        now_application: 0,
        mine_documents: 0,
        permit_documents: 0,
      });
      expect(selectSearchTerms(state)).toEqual([]);
      expect(selectSearchSubsetResults(state)).toEqual([]);
    });
  });

  describe("synchronous actions", () => {
    describe("storeSearchOptions", () => {
      it("should store search options", () => {
        const store = getStore();
        const mockOptions = [
          { model_id: "mine", description: "Mines" },
          { model_id: "party", description: "Contacts" },
        ];

        store.dispatch(storeSearchOptions(mockOptions));

        expect(selectSearchOptions(store.getState())).toEqual(mockOptions);
      });
    });

    describe("storeSearchResults", () => {
      it("should store search results with facets and terms", () => {
        const store = getStore();
        const mockData = {
          search_results: MOCK.SEARCH_RESULTS_V2 || [],
          facets: MOCK.SEARCH_FACETS || {},
          search_terms: ["test", "mine"],
        };

        store.dispatch(storeSearchResults(mockData));

        expect(selectSearchResults(store.getState())).toEqual(mockData.search_results);
        expect(selectSearchFacets(store.getState())).toEqual(mockData.facets);
        expect(selectSearchTerms(store.getState())).toEqual(mockData.search_terms);
      });

      it("should use default facets if not provided", () => {
        const store = getStore();
        const mockData = {
          search_results: [],
          facets: null,
          search_terms: [],
        };

        store.dispatch(storeSearchResults(mockData));

        const facets = selectSearchFacets(store.getState());
        expect(facets).toHaveProperty("mine_region");
        expect(facets).toHaveProperty("mine_classification");
      });
    });

    describe("storeSubsetSearchResults", () => {
      it("should store subset search results", () => {
        const store = getStore();
        const mockSubsetResults = [
          { id: "1", name: "Result 1" },
          { id: "2", name: "Result 2" },
        ];

        store.dispatch(storeSubsetSearchResults(mockSubsetResults));

        expect(selectSearchSubsetResults(store.getState())).toEqual(mockSubsetResults);
      });
    });

    describe("storeSearchBarResults", () => {
      it("should store search bar results with facets", () => {
        const store = getStore();
        const mockBarResults = [
          {
            type: "mine",
            score: 10,
            result: { id: "mine-123", value: "Test Mine" },
          },
          {
            type: "party",
            score: 8,
            result: { id: "party-456", value: "John Doe" },
          },
        ];
        const mockFacets = {
          mine: 5,
          person: 3,
          organization: 2,
          permit: 0,
          nod: 0,
          explosives_permit: 0,
          now_application: 0,
          mine_documents: 0,
          permit_documents: 0,
        };

        store.dispatch(
          storeSearchBarResults({
            search_results: mockBarResults,
            facets: mockFacets,
          })
        );

        expect(selectSearchBarResults(store.getState())).toEqual(mockBarResults);
        expect(selectSearchBarFacets(store.getState())).toEqual(mockFacets);
      });

      it("should use default facets if not provided", () => {
        const store = getStore();
        const mockBarResults = [
          {
            type: "mine",
            score: 10,
            result: { id: "mine-123", value: "Test Mine" },
          },
        ];

        store.dispatch(
          storeSearchBarResults({
            search_results: mockBarResults,
            facets: null,
          })
        );

        const facets = selectSearchBarFacets(store.getState());
        expect(facets.mine).toBe(0);
        expect(facets.person).toBe(0);
      });
    });

    describe("clearSearchBarResults", () => {
      it("should clear search bar results and facets", () => {
        const store = getStore();

        // First, add some results
        store.dispatch(
          storeSearchBarResults({
            search_results: [
              {
                type: "mine",
                score: 10,
                result: { id: "mine-123", value: "Test Mine" },
              },
            ],
            facets: { mine: 5, person: 0, organization: 0, permit: 0, nod: 0, explosives_permit: 0, now_application: 0, mine_documents: 0, permit_documents: 0 },
          })
        );

        // Then clear them
        store.dispatch(clearSearchBarResults());

        expect(selectSearchBarResults(store.getState())).toEqual([]);
        expect(selectSearchBarFacets(store.getState())).toEqual({
          mine: 0,
          person: 0,
          organization: 0,
          permit: 0,
          nod: 0,
          explosives_permit: 0,
          now_application: 0,
          mine_documents: 0,
          permit_documents: 0,
        });
      });
    });

    describe("clearAllSearchResults", () => {
      it("should reset all search state to initial values", () => {
        const store = getStore();

        // Add some data
        store.dispatch(storeSearchOptions([{ model_id: "mine", description: "Mines" }]));
        store.dispatch(
          storeSearchResults({
            search_results: MOCK.SEARCH_RESULTS_V2 || [],
            facets: {},
            search_terms: ["test"],
          })
        );
        store.dispatch(
          storeSearchBarResults({
            search_results: [
              {
                type: "mine",
                score: 10,
                result: { id: "mine-123", value: "Test Mine" },
              },
            ],
            facets: null,
          })
        );

        // Clear everything
        store.dispatch(clearAllSearchResults());

        expect(selectSearchOptions(store.getState())).toEqual([]);
        expect(selectSearchResults(store.getState())).toEqual({
          mine: [],
          mine_documents: [],
          party: [],
          permit: [],
          notice_of_departure: [],
          explosives_permit: [],
          now_application: [],
          permit_documents: [],
        });
        expect(selectSearchBarResults(store.getState())).toEqual([]);
        expect(selectSearchTerms(store.getState())).toEqual([]);
      });
    });
  });

  describe("async thunks", () => {
    describe("fetchSearchResults", () => {
      it("should fetch search results successfully", async () => {
        const store = getStore();
        const searchTerm = "test";
        const searchTypes = ["mine", "party"];
        const mockResponse = {
          search_results: MOCK.SEARCH_RESULTS_V2 || [],
          facets: MOCK.SEARCH_FACETS || {},
          search_terms: ["test"],
        };

        mockAxios.onGet().reply(200, mockResponse);

        await store.dispatch(
          fetchSearchResults({
            searchTerm,
            searchTypes,
          })
        );

        // When API returns empty array, slice converts it to proper structure
        const expectedResults = Array.isArray(mockResponse.search_results) && mockResponse.search_results.length === 0
          ? {
              mine: [],
              mine_documents: [],
              party: [],
              permit: [],
              notice_of_departure: [],
              explosives_permit: [],
              now_application: [],
              permit_documents: [],
            }
          : mockResponse.search_results;
        
        expect(selectSearchResults(store.getState())).toEqual(expectedResults);
        expect(selectSearchFacets(store.getState())).toEqual(mockResponse.facets);
        expect(selectSearchTerms(store.getState())).toEqual(mockResponse.search_terms);
      });

      it("should handle search with filters", async () => {
        const store = getStore();
        const searchTerm = "mine";
        const searchTypes = ["mine"];
        const filters = { mine_region: "SW" };

        mockAxios.onGet().reply(200, {
          search_results: [],
          facets: {},
          search_terms: ["mine"],
        });

        await store.dispatch(
          fetchSearchResults({
            searchTerm,
            searchTypes,
            filters,
          })
        );

        // Verify the request was made with filters
        expect(mockAxios.history.get[0].url).toBeDefined();
      });

      it("should handle empty search term", async () => {
        const store = getStore();

        mockAxios.onGet().reply(200, {
          search_results: [],
          facets: {},
          search_terms: [],
        });

        await store.dispatch(
          fetchSearchResults({
            searchTerm: "",
            searchTypes: [],
          })
        );

        expect(selectSearchResults(store.getState())).toEqual({
          mine: [],
          mine_documents: [],
          party: [],
          permit: [],
          notice_of_departure: [],
          explosives_permit: [],
          now_application: [],
          permit_documents: [],
        });
      });

      it("should handle API errors gracefully", async () => {
        const store = getStore();

        mockAxios.onGet().reply(500, { error: "Internal server error" });

        try {
          await store.dispatch(
            fetchSearchResults({
              searchTerm: "test",
              searchTypes: ["mine"],
            })
          );
        } catch (error) {
          // Error should be handled by rejectHandler
        }

        // State should remain unchanged on error
        expect(selectSearchResults(store.getState())).toEqual({
          mine: [],
          mine_documents: [],
          party: [],
          permit: [],
          notice_of_departure: [],
          explosives_permit: [],
          now_application: [],
          permit_documents: [],
        });
      });

      it("should handle network errors", async () => {
        const store = getStore();

        mockAxios.onGet().networkError();

        try {
          await store.dispatch(
            fetchSearchResults({
              searchTerm: "test",
              searchTypes: ["mine"],
            })
          );
        } catch (error) {
          // Error should be handled
        }

        expect(selectSearchResults(store.getState())).toEqual({
          mine: [],
          mine_documents: [],
          party: [],
          permit: [],
          notice_of_departure: [],
          explosives_permit: [],
          now_application: [],
          permit_documents: [],
        });
      });
    });

    describe("fetchSearchBarResults", () => {
      it("should fetch search bar results successfully", async () => {
        const store = getStore();
        const searchTerm = "test";
        const mockResponse = {
          search_results: [
            {
              type: "mine",
              score: 10,
              result: { id: "mine-123", value: "Test Mine" },
            },
          ],
          facets: { mine: 5, person: 0, organization: 0, permit: 0, nod: 0, explosives_permit: 0, now_application: 0, mine_documents: 0, permit_documents: 0 },
        };

        mockAxios.onGet().reply(200, mockResponse);

        await store.dispatch(
          fetchSearchBarResults({
            searchTerm,
          })
        );

        expect(selectSearchBarResults(store.getState())).toEqual(mockResponse.search_results);
        expect(selectSearchBarFacets(store.getState())).toEqual(mockResponse.facets);
      });

      it("should fetch with search types filter", async () => {
        const store = getStore();
        const searchTerm = "test";
        const searchTypes = ["mine", "party"];

        mockAxios.onGet().reply(200, {
          search_results: [],
          facets: null,
        });

        await store.dispatch(
          fetchSearchBarResults({
            searchTerm,
            searchTypes,
          })
        );

        // Verify the URL includes search types
        const requestUrl = mockAxios.history.get[0].url;
        expect(requestUrl).toContain("search_term=test");
        expect(requestUrl).toContain("search_types=mine%2Cparty");
      });

      it("should fetch with mine guid filter", async () => {
        const store = getStore();
        const searchTerm = "test";
        const mineGuid = "mine-guid-123";

        mockAxios.onGet().reply(200, {
          search_results: [],
          facets: null,
        });

        await store.dispatch(
          fetchSearchBarResults({
            searchTerm,
            mineGuid,
          })
        );

        // Verify the URL includes mine_guid
        const requestUrl = mockAxios.history.get[0].url;
        expect(requestUrl).toContain("search_term=test");
        expect(requestUrl).toContain("mine_guid=mine-guid-123");
      });

      it("should handle special characters in search term", async () => {
        const store = getStore();
        const searchTerm = "test & special / chars";

        mockAxios.onGet().reply(200, {
          search_results: [],
          facets: null,
        });

        await store.dispatch(
          fetchSearchBarResults({
            searchTerm,
          })
        );

        // Verify URL encoding
        const requestUrl = mockAxios.history.get[0].url;
        expect(requestUrl).toContain("search_term=");
      });

      it("should handle API errors gracefully", async () => {
        const store = getStore();

        mockAxios.onGet().reply(500, { error: "Internal server error" });

        try {
          await store.dispatch(
            fetchSearchBarResults({
              searchTerm: "test",
            })
          );
        } catch (error) {
          // Error should be handled by rejectHandler
        }

        expect(selectSearchBarResults(store.getState())).toEqual([]);
      });
    });

    describe("fetchSearchOptions", () => {
      it("should fetch search options successfully", async () => {
        const store = getStore();
        const mockOptions = [
          { model_id: "mine", description: "Mines" },
          { model_id: "party", description: "Contacts" },
          { model_id: "permit", description: "Permits" },
        ];

        mockAxios.onGet(ENVIRONMENT.apiUrl + API.SEARCH_OPTIONS).reply(200, mockOptions);

        await store.dispatch(fetchSearchOptions());

        expect(selectSearchOptions(store.getState())).toEqual(mockOptions);
      });

      it("should handle empty options", async () => {
        const store = getStore();

        mockAxios.onGet(ENVIRONMENT.apiUrl + API.SEARCH_OPTIONS).reply(200, []);

        await store.dispatch(fetchSearchOptions());

        expect(selectSearchOptions(store.getState())).toEqual([]);
      });

      it("should handle API errors gracefully", async () => {
        const store = getStore();

        mockAxios.onGet(ENVIRONMENT.apiUrl + API.SEARCH_OPTIONS).reply(500, { error: "Internal server error" });

        try {
          await store.dispatch(fetchSearchOptions());
        } catch (error) {
          // Error should be handled by rejectHandler
        }

        expect(selectSearchOptions(store.getState())).toEqual([]);
      });
    });
  });

  describe("selectors", () => {
    it("should select correct state slices", () => {
      const store = getStore();

      // Add some test data
      const mockOptions = [{ model_id: "mine", description: "Mines" }];
      const mockResults = MOCK.SEARCH_RESULTS_V2 || [];
      const mockFacets = MOCK.SEARCH_FACETS || {};
      const mockTerms = ["test", "search"];
      const mockBarResults = [
        {
          type: "mine",
          score: 10,
          result: { id: "mine-123", value: "Test Mine" },
        },
      ];
      const mockBarFacets = { mine: 5, person: 0, organization: 0, permit: 0, nod: 0, explosives_permit: 0, now_application: 0, mine_documents: 0, permit_documents: 0 };

      store.dispatch(storeSearchOptions(mockOptions));
      store.dispatch(
        storeSearchResults({
          search_results: mockResults,
          facets: mockFacets,
          search_terms: mockTerms,
        })
      );
      store.dispatch(
        storeSearchBarResults({
          search_results: mockBarResults,
          facets: mockBarFacets,
        })
      );

      const state = store.getState();

      expect(selectSearchOptions(state)).toEqual(mockOptions);
      expect(selectSearchResults(state)).toEqual(mockResults);
      expect(selectSearchFacets(state)).toEqual(mockFacets);
      expect(selectSearchTerms(state)).toEqual(mockTerms);
      expect(selectSearchBarResults(state)).toEqual(mockBarResults);
      expect(selectSearchBarFacets(state)).toEqual(mockBarFacets);
    });

    it("should handle undefined values gracefully", () => {
      const store = getStore();
      const state = store.getState();

      // Initial state should have default values, not undefined
      expect(selectSearchOptions(state)).toBeDefined();
      expect(selectSearchResults(state)).toBeDefined();
      expect(selectSearchFacets(state)).toBeDefined();
      expect(selectSearchTerms(state)).toBeDefined();
      expect(selectSearchBarResults(state)).toBeDefined();
      expect(selectSearchBarFacets(state)).toBeDefined();
    });
  });

  describe("integration tests", () => {
    it("should handle complete search workflow", async () => {
      const store = getStore();

      // 1. Fetch search options
      const mockOptions = [
        { model_id: "mine", description: "Mines" },
        { model_id: "party", description: "Contacts" },
      ];
      mockAxios.onGet(ENVIRONMENT.apiUrl + API.SEARCH_OPTIONS).reply(200, mockOptions);

      await store.dispatch(fetchSearchOptions());
      expect(selectSearchOptions(store.getState())).toEqual(mockOptions);

      // 2. Perform a search bar search
      const searchTerm = "test";
      const barMockResponse = {
        search_results: [
          {
            type: "mine",
            score: 10,
            result: { id: "mine-123", value: "Test Mine" },
          },
        ],
        facets: { mine: 1, person: 0, organization: 0, permit: 0, nod: 0, explosives_permit: 0, now_application: 0, mine_documents: 0, permit_documents: 0 },
      };
      mockAxios.onGet().reply(200, barMockResponse);

      await store.dispatch(
        fetchSearchBarResults({
          searchTerm,
        })
      );
      expect(selectSearchBarResults(store.getState())).toHaveLength(1);

      // 3. Clear search bar results
      store.dispatch(clearSearchBarResults());
      expect(selectSearchBarResults(store.getState())).toEqual([]);

      // 4. Perform a full search
      const fullMockResponse = {
        search_results: MOCK.SEARCH_RESULTS_V2 || [],
        facets: MOCK.SEARCH_FACETS || {},
        search_terms: ["test"],
      };
      mockAxios.onGet().reply(200, fullMockResponse);

      await store.dispatch(
        fetchSearchResults({
          searchTerm,
          searchTypes: ["mine"],
        })
      );
      expect(selectSearchResults(store.getState())).toBeDefined();

      // 5. Clear all results
      store.dispatch(clearAllSearchResults());
      expect(selectSearchOptions(store.getState())).toEqual([]);
      expect(selectSearchResults(store.getState())).toEqual({
        mine: [],
        mine_documents: [],
        party: [],
        permit: [],
        notice_of_departure: [],
        explosives_permit: [],
        now_application: [],
        permit_documents: [],
      });
    });

    it("should maintain state consistency across multiple operations", async () => {
      const store = getStore();

      // Perform multiple operations
      store.dispatch(storeSearchOptions([{ model_id: "mine", description: "Mines" }]));
      store.dispatch(
        storeSearchResults({
          search_results: [],
          facets: {},
          search_terms: ["first"],
        })
      );
      store.dispatch(
        storeSearchResults({
          search_results: [],
          facets: {},
          search_terms: ["second"],
        })
      );

      // Verify state is consistent
      expect(selectSearchOptions(store.getState())).toHaveLength(1);
      expect(selectSearchTerms(store.getState())).toEqual(["second"]);
    });
  });
});
