import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import getStore from "@/store/configureStore";
import { useSearchResults } from "@/components/search/useSearchResults";
import {
  SEARCH_RESULTS_V2,
  SEARCH_FACETS,
  SEARCH_OPTIONS,
} from "@mds/common/tests/mocks/searchMockData";
import { searchReducerType } from "@mds/common/redux/slices/searchSlice";
import { defaultInitialState } from "@mds/common/tests/utils/ReduxWrapper";

const getDefaultState = () => ({
  ...defaultInitialState,
  [searchReducerType]: {
    searchOptions: SEARCH_OPTIONS,
    searchResults: SEARCH_RESULTS_V2,
    searchTerms: ["test"],
    searchFacets: SEARCH_FACETS,
    isSearching: false,
    error: null,
  },
});

// Test component that exposes hook values
const TestComponent: React.FC<{ onRender: (values: ReturnType<typeof useSearchResults>) => void }> = ({ onRender }) => {
  const hookValues = useSearchResults();
  onRender(hookValues);
  
  return (
    <div>
      <input
        data-testid="search-input"
        value={hookValues.searchInputValue}
        onChange={(e) => hookValues.setSearchInputValue(e.target.value)}
      />
      <button
        data-testid="add-filter"
        onClick={() => hookValues.handleFilterChange("mine_region", "SW", true)}
      >
        Add Filter
      </button>
      <button
        data-testid="remove-filter"
        onClick={() => hookValues.handleFilterChange("mine_region", "SW", false)}
      >
        Remove Filter
      </button>
      <button
        data-testid="clear-filters"
        onClick={hookValues.clearAllFilters}
      >
        Clear Filters
      </button>
      <span data-testid="has-filters">{hookValues.hasActiveFilters.toString()}</span>
      <span data-testid="query">{hookValues.params.q || ""}</span>
      <span data-testid="tab">{hookValues.params.t || ""}</span>
      <span data-testid="total-results">{hookValues.results.totalResults}</span>
    </div>
  );
};

const renderTestComponent = (
  initialEntries = ["/search?q=test"],
  state = getDefaultState(),
  onRender = jest.fn()
) => {
  const store = getStore(state);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <TestComponent onRender={onRender} />
      </MemoryRouter>
    </Provider>
  );
};

describe("useSearchResults", () => {
  describe("Initial State", () => {
    it("initializes with values from URL query params", () => {
      renderTestComponent(["/search?q=test"]);

      expect(screen.getByTestId("query")).toHaveTextContent("test");
      expect(screen.getByTestId("search-input")).toHaveValue("test");
    });

    it("initializes with tab from URL", () => {
      renderTestComponent(["/search?q=test&t=mine"]);

      expect(screen.getByTestId("tab")).toHaveTextContent("mine");
    });

    it("initializes with empty selectedFilters", () => {
      renderTestComponent();

      expect(screen.getByTestId("has-filters")).toHaveTextContent("false");
    });
  });

  describe("Search Input", () => {
    it("updates searchInputValue when input changes", async () => {
      renderTestComponent();

      const input = screen.getByTestId("search-input");
      fireEvent.change(input, { target: { value: "new query" } });

      await waitFor(() => {
        expect(input).toHaveValue("new query");
      });
    });
  });

  describe("Highlight Regex", () => {
    it("creates regex from search term", () => {
      let hookValues: ReturnType<typeof useSearchResults> | null = null;
      renderTestComponent(["/search?q=test"], getDefaultState(), (values) => {
        hookValues = values;
      });

      expect(hookValues?.highlightRegex).toBeInstanceOf(RegExp);
      expect(hookValues?.highlightRegex?.test("test")).toBe(true);
      expect(hookValues?.highlightRegex?.test("TEST")).toBe(true);
    });

    it("escapes special regex characters", () => {
      let hookValues: ReturnType<typeof useSearchResults> | null = null;
      renderTestComponent(["/search?q=test.query"], getDefaultState(), (values) => {
        hookValues = values;
      });

      expect(hookValues?.highlightRegex?.test("test.query")).toBe(true);
      expect(hookValues?.highlightRegex?.test("testXquery")).toBe(false);
    });

    it("returns null when no query", () => {
      let hookValues: ReturnType<typeof useSearchResults> | null = null;
      renderTestComponent(["/search"], getDefaultState(), (values) => {
        hookValues = values;
      });

      expect(hookValues?.highlightRegex).toBeNull();
    });
  });

  describe("Filter Management", () => {
    it("adds filter via handleFilterChange", async () => {
      renderTestComponent();

      expect(screen.getByTestId("has-filters")).toHaveTextContent("false");

      fireEvent.click(screen.getByTestId("add-filter"));

      await waitFor(() => {
        expect(screen.getByTestId("has-filters")).toHaveTextContent("true");
      });
    });

    it("removes filter via handleFilterChange", async () => {
      renderTestComponent();

      fireEvent.click(screen.getByTestId("add-filter"));
      await waitFor(() => {
        expect(screen.getByTestId("has-filters")).toHaveTextContent("true");
      });

      fireEvent.click(screen.getByTestId("remove-filter"));
      await waitFor(() => {
        expect(screen.getByTestId("has-filters")).toHaveTextContent("false");
      });
    });

    it("clears all filters via clearAllFilters", async () => {
      renderTestComponent();

      fireEvent.click(screen.getByTestId("add-filter"));
      await waitFor(() => {
        expect(screen.getByTestId("has-filters")).toHaveTextContent("true");
      });

      fireEvent.click(screen.getByTestId("clear-filters"));
      await waitFor(() => {
        expect(screen.getByTestId("has-filters")).toHaveTextContent("false");
      });
    });
  });

  describe("Results Processing", () => {
    it("provides processed results", () => {
      let hookValues: ReturnType<typeof useSearchResults> | null = null;
      renderTestComponent(["/search?q=test"], getDefaultState(), (values) => {
        hookValues = values;
      });

      expect(hookValues?.results).toBeDefined();
      expect(hookValues?.results.totalResults).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(hookValues?.results.mineResults)).toBe(true);
      expect(Array.isArray(hookValues?.results.peopleResults)).toBe(true);
      expect(Array.isArray(hookValues?.results.organizationResults)).toBe(true);
      expect(Array.isArray(hookValues?.results.permitResults)).toBe(true);
      expect(Array.isArray(hookValues?.results.documentResults)).toBe(true);
    });

    it("separates people and organizations from party results", () => {
      const stateWithParties = {
        ...getDefaultState(),
        [searchReducerType]: {
          ...getDefaultState()[searchReducerType],
          searchResults: {
            ...SEARCH_RESULTS_V2,
            party: [
              { result: { party_guid: "1", party_type_code: "PER", name: "Person" } },
              { result: { party_guid: "2", party_type_code: "ORG", name: "Org" } },
            ],
          },
        },
      };

      let hookValues: ReturnType<typeof useSearchResults> | null = null;
      renderTestComponent(["/search?q=test"], stateWithParties, (values) => {
        hookValues = values;
      });

      expect(hookValues?.results.peopleResults.length).toBe(1);
      expect(hookValues?.results.organizationResults.length).toBe(1);
    });
  });

  describe("Selectors", () => {
    it("provides searchFacets from redux", () => {
      let hookValues: ReturnType<typeof useSearchResults> | null = null;
      renderTestComponent(["/search?q=test"], getDefaultState(), (values) => {
        hookValues = values;
      });

      expect(hookValues?.searchFacets).toBeDefined();
    });

    it("provides partyRelationshipTypeHash from redux", () => {
      let hookValues: ReturnType<typeof useSearchResults> | null = null;
      renderTestComponent(["/search?q=test"], getDefaultState(), (values) => {
        hookValues = values;
      });

      expect(hookValues?.partyRelationshipTypeHash).toBeDefined();
    });
  });
});
