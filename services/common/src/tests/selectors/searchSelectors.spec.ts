import {
  getSearchResults,
  getSearchFacets,
  getSearchTerms,
  getSearchBarResults,
} from "@mds/common/redux/selectors/searchSelectors";
import { SEARCH } from "@mds/common/constants/reducerTypes";
import * as MOCK from "../mocks/dataMocks";

describe("searchSelectors", () => {
  describe("getSearchResults", () => {
    it("returns search results from state", () => {
      const state = {
        [SEARCH]: {
          searchResults: MOCK.SEARCH_RESULTS_V2,
        },
      };

      const results = getSearchResults(state);
      expect(results).toEqual(MOCK.SEARCH_RESULTS_V2);
    });

    it("returns empty object when no results", () => {
      const state = {
        [SEARCH]: {
          searchResults: {},
        },
      };

      const results = getSearchResults(state);
      expect(results).toEqual({});
    });

    it("handles undefined search state", () => {
      const state = {
        [SEARCH]: undefined,
      };

      expect(() => getSearchResults(state)).toThrow();
    });

    it("returns results for specific types", () => {
      const state = {
        [SEARCH]: {
          searchResults: {
            mine: [{ type: "mine", score: 10, result: {} }],
            party: [{ type: "party", score: 8, result: {} }],
          },
        },
      };

      const results = getSearchResults(state);
      expect(results.mine).toHaveLength(1);
      expect(results.party).toHaveLength(1);
    });
  });

  describe("getSearchFacets", () => {
    it("returns search facets from state", () => {
      const state = {
        [SEARCH]: {
          searchFacets: MOCK.SEARCH_FACETS,
        },
      };

      const facets = getSearchFacets(state);
      expect(facets).toEqual(MOCK.SEARCH_FACETS);
    });

    it("returns empty object when no facets", () => {
      const state = {
        [SEARCH]: {
          searchFacets: {},
        },
      };

      const facets = getSearchFacets(state);
      expect(facets).toEqual({});
    });

    it("handles undefined facets", () => {
      const state = {
        [SEARCH]: {
          searchFacets: undefined,
        },
      };

      const facets = getSearchFacets(state);
      expect(facets).toBeUndefined();
    });

    it("returns facets with counts", () => {
      const state = {
        [SEARCH]: {
          searchFacets: {
            mine_region: [
              { key: "SW", count: 10 },
              { key: "NE", count: 5 },
            ],
          },
        },
      };

      const facets = getSearchFacets(state);
      expect(facets.mine_region).toHaveLength(2);
      expect(facets.mine_region[0].count).toBe(10);
    });
  });

  describe("getSearchTerms", () => {
    it("returns search terms from state", () => {
      const state = {
        [SEARCH]: {
          searchTerms: ["test", "mine"],
        },
      };

      const terms = getSearchTerms(state);
      expect(terms).toEqual(["test", "mine"]);
    });

    it("returns empty array when no terms", () => {
      const state = {
        [SEARCH]: {
          searchTerms: [],
        },
      };

      const terms = getSearchTerms(state);
      expect(terms).toEqual([]);
    });

    it("handles undefined search terms", () => {
      const state = {
        [SEARCH]: {
          searchTerms: undefined,
        },
      };

      const terms = getSearchTerms(state);
      expect(terms).toBeUndefined();
    });

    it("returns single term as array", () => {
      const state = {
        [SEARCH]: {
          searchTerms: ["test"],
        },
      };

      const terms = getSearchTerms(state);
      expect(terms).toEqual(["test"]);
      expect(Array.isArray(terms)).toBe(true);
    });

    it("preserves term order", () => {
      const state = {
        [SEARCH]: {
          searchTerms: ["first", "second", "third"],
        },
      };

      const terms = getSearchTerms(state);
      expect(terms[0]).toBe("first");
      expect(terms[1]).toBe("second");
      expect(terms[2]).toBe("third");
    });
  });

  describe("getSearchBarResults", () => {
    it("returns search bar results from state", () => {
      const mockBarResults = [
        {
          type: "mine",
          score: 10,
          result: {
            id: "mine-123",
            value: "Test Mine",
          },
        },
      ];

      const state = {
        [SEARCH]: {
          searchBarResults: mockBarResults,
        },
      };

      const results = getSearchBarResults(state);
      expect(results).toEqual(mockBarResults);
    });

    it("returns empty array when no bar results", () => {
      const state = {
        [SEARCH]: {
          searchBarResults: [],
        },
      };

      const results = getSearchBarResults(state);
      expect(results).toEqual([]);
    });

    it("handles undefined bar results", () => {
      const state = {
        [SEARCH]: {
          searchBarResults: undefined,
        },
      };

      const results = getSearchBarResults(state);
      expect(results).toBeUndefined();
    });

    it("returns results with highlights", () => {
      const mockBarResults = [
        {
          type: "party",
          score: 8,
          result: {
            id: "party-123",
            value: "John Doe",
            highlight: "<mark>John</mark> Doe",
          },
        },
      ];

      const state = {
        [SEARCH]: {
          searchBarResults: mockBarResults,
        },
      };

      const results = getSearchBarResults(state);
      expect(results[0].result.highlight).toContain("<mark>");
    });

    it("returns limited number of results", () => {
      const mockBarResults = Array.from({ length: 4 }, (_, i) => ({
        type: "mine",
        score: 10 - i,
        result: {
          id: `mine-${i}`,
          value: `Mine ${i}`,
        },
      }));

      const state = {
        [SEARCH]: {
          searchBarResults: mockBarResults,
        },
      };

      const results = getSearchBarResults(state);
      expect(results).toHaveLength(4);
    });
  });

  describe("Selector Composition", () => {
    it("handles complete search state", () => {
      const state = {
        [SEARCH]: {
          searchResults: MOCK.SEARCH_RESULTS_V2,
          searchFacets: MOCK.SEARCH_FACETS,
          searchTerms: ["test"],
          searchBarResults: [],
        },
      };

      expect(getSearchResults(state)).toEqual(MOCK.SEARCH_RESULTS_V2);
      expect(getSearchFacets(state)).toEqual(MOCK.SEARCH_FACETS);
      expect(getSearchTerms(state)).toEqual(["test"]);
      expect(getSearchBarResults(state)).toEqual([]);
    });

    it("handles empty search state", () => {
      const state = {
        [SEARCH]: {
          searchResults: {},
          searchFacets: {},
          searchTerms: [],
          searchBarResults: [],
        },
      };

      expect(getSearchResults(state)).toEqual({});
      expect(getSearchFacets(state)).toEqual({});
      expect(getSearchTerms(state)).toEqual([]);
      expect(getSearchBarResults(state)).toEqual([]);
    });
  });

  describe("Edge Cases", () => {
    it("handles null state", () => {
      const state = {
        [SEARCH]: null,
      };

      expect(() => getSearchResults(state)).toThrow();
    });

    it("handles nested null values", () => {
      const state = {
        [SEARCH]: {
          searchResults: null,
          searchFacets: null,
          searchTerms: null,
        },
      };

      expect(getSearchResults(state)).toBeNull();
      expect(getSearchFacets(state)).toBeNull();
      expect(getSearchTerms(state)).toBeNull();
    });

    it("handles very large result sets", () => {
      const largeResults = {
        mine: Array.from({ length: 1000 }, (_, i) => ({
          type: "mine",
          score: 10 - i * 0.01,
          result: { mine_guid: `mine-${i}` },
        })),
      };

      const state = {
        [SEARCH]: {
          searchResults: largeResults,
        },
      };

      const results = getSearchResults(state);
      expect(results.mine).toHaveLength(1000);
    });

    it("handles facets with many values", () => {
      const manyFacetValues = {
        mine_region: Array.from({ length: 100 }, (_, i) => ({
          key: `Region-${i}`,
          count: Math.floor(Math.random() * 100),
        })),
      };

      const state = {
        [SEARCH]: {
          searchFacets: manyFacetValues,
        },
      };

      const facets = getSearchFacets(state);
      expect(facets.mine_region).toHaveLength(100);
    });
  });

  describe("Type Safety", () => {
    it("returns correct types for results", () => {
      const state = {
        [SEARCH]: {
          searchResults: {
            mine: [{ type: "mine", score: 10, result: {} }],
          },
        },
      };

      const results = getSearchResults(state);
      expect(typeof results).toBe("object");
      expect(Array.isArray(results.mine)).toBe(true);
    });

    it("returns correct types for facets", () => {
      const state = {
        [SEARCH]: {
          searchFacets: {
            mine_region: [{ key: "SW", count: 10 }],
          },
        },
      };

      const facets = getSearchFacets(state);
      expect(typeof facets).toBe("object");
      expect(Array.isArray(facets.mine_region)).toBe(true);
      expect(typeof facets.mine_region[0].key).toBe("string");
      expect(typeof facets.mine_region[0].count).toBe("number");
    });

    it("returns correct types for terms", () => {
      const state = {
        [SEARCH]: {
          searchTerms: ["test", "mine"],
        },
      };

      const terms = getSearchTerms(state);
      expect(Array.isArray(terms)).toBe(true);
      expect(typeof terms[0]).toBe("string");
    });
  });
});
