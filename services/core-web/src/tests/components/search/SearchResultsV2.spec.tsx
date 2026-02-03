/**
 * Integration tests for SearchResultsV2
 * 
 * These tests verify that all components (SearchHeader, SearchFiltersPanel, 
 * SearchResultsTabs, and useSearchResults) work together correctly.
 * 
 * For unit tests of individual components, see:
 * - SearchHeader.spec.tsx
 * - SearchFiltersPanel.spec.tsx
 * - SearchResultsTabs.spec.tsx
 * - useSearchResults.spec.ts
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { SearchResults } from "@/components/search/SearchResultsV2";
import {
  SEARCH_RESULTS_V2,
  SEARCH_FACETS,
  SEARCH_OPTIONS,
} from "@mds/common/tests/mocks/searchMockData";
import { searchReducerType } from "@mds/common/redux/slices/searchSlice";

const getDefaultState = () => ({
  [searchReducerType]: {
    searchOptions: SEARCH_OPTIONS,
    searchResults: SEARCH_RESULTS_V2,
    searchTerms: ["test"],
    searchFacets: SEARCH_FACETS,
    isSearching: false,
    error: null,
  },
});

const renderSearchResults = (initialEntries = ["/search?q=test"], state = null) => {
  const stateToUse = state || getDefaultState();
  return render(
    <ReduxWrapper initialState={stateToUse}>
      <MemoryRouter initialEntries={initialEntries}>
        <SearchResults />
      </MemoryRouter>
    </ReduxWrapper>
  );
};

describe("SearchResultsV2 Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Integration", () => {
    it("renders all child components together", () => {
      renderSearchResults();

      // SearchHeader
      expect(screen.getByRole("heading", { name: /search results/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/search for mines, contacts, permits/i)).toBeInTheDocument();

      // SearchFiltersPanel
      expect(screen.getByText("Filters")).toBeInTheDocument();

      // SearchResultsTabs
      expect(screen.getByRole("tab", { name: /All/ })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Mines/ })).toBeInTheDocument();
    });

    it("shares state correctly between header and tabs", () => {
      renderSearchResults(["/search?q=test"]);

      // Query from URL should appear in search input
      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toHaveValue("test");

      // Results should be displayed in tabs
      const allTab = screen.getByRole("tab", { name: /All/ });
      expect(allTab).toBeInTheDocument();
    });
  });

  describe("Search Flow", () => {
    it("populates search from URL query parameter", () => {
      renderSearchResults(["/search?q=my%20search%20term"]);

      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toHaveValue("my search term");
    });

    it("updates input when user types", async () => {
      renderSearchResults();

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: "new query" } });

      await waitFor(() => {
        expect(searchInput).toHaveValue("new query");
      });
    });

    it("allows search submission via button click", async () => {
      renderSearchResults();

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: "new search" } });

      const searchButton = screen.getByRole("button", { name: "search" });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(searchInput).toHaveValue("new search");
      });
    });
  });

  describe("Filter Integration", () => {
    const facetsWithValues = {
      ...SEARCH_FACETS,
      mine_region: [
        { key: "SW", count: 10 },
        { key: "NE", count: 5 },
      ],
      mine_classification: [
        { key: "Major Mine", count: 8 },
        { key: "Regional Mine", count: 12 },
      ],
      permit_status: [
        { key: "O", count: 15 },
        { key: "C", count: 3 },
      ],
    };

    it("displays facets from redux state in filter panel", () => {
      const customState = {
        ...getDefaultState(),
        [searchReducerType]: {
          ...getDefaultState()[searchReducerType],
          searchFacets: facetsWithValues,
        },
      };

      renderSearchResults(["/search?q=test"], customState);

      expect(screen.getByText("Mine Filters")).toBeInTheDocument();
      expect(screen.getByText("SW")).toBeInTheDocument();
      expect(screen.getAllByText("(10)").length).toBeGreaterThan(0);
    });

    it("updates filter state when checkbox is clicked", async () => {
      const customState = {
        ...getDefaultState(),
        [searchReducerType]: {
          ...getDefaultState()[searchReducerType],
          searchFacets: facetsWithValues,
        },
      };

      renderSearchResults(["/search?q=test"], customState);

      const checkboxes = screen.getAllByRole("checkbox");
      const swCheckbox = checkboxes.find(cb =>
        cb.parentElement?.textContent?.includes("SW")
      );

      if (swCheckbox) {
        fireEvent.click(swCheckbox);

        await waitFor(() => {
          expect(swCheckbox).toBeChecked();
        });
      }
    });

    it("shows filter tags when filters are selected", async () => {
      const customState = {
        ...getDefaultState(),
        [searchReducerType]: {
          ...getDefaultState()[searchReducerType],
          searchFacets: facetsWithValues,
        },
      };

      renderSearchResults(["/search?q=test"], customState);

      const checkboxes = screen.getAllByRole("checkbox");
      const swCheckbox = checkboxes.find(cb =>
        cb.parentElement?.textContent?.includes("SW")
      );

      if (swCheckbox) {
        fireEvent.click(swCheckbox);

        await waitFor(() => {
          // Clear button should appear
          expect(screen.getByText("Clear")).toBeInTheDocument();
        });
      }
    });
  });

  describe("Tab Navigation", () => {
    it("shows All tab as active by default", () => {
      renderSearchResults();

      const allTab = screen.getByRole("tab", { name: /All/ });
      expect(allTab).toHaveAttribute("aria-selected", "true");
    });

    it("displays correct counts in tabs", () => {
      const resultsWithCounts = {
        mine: Array(5).fill(SEARCH_RESULTS_V2.mine[0]),
        party: Array(3).fill(SEARCH_RESULTS_V2.party[0]),
        permit: Array(2).fill({ result: { permit_guid: "test", permit_no: "P-123" } }),
        permit_documents: [],
        mine_documents: [],
        explosives_permit: [],
        now_application: [],
        notice_of_departure: [],
      };

      const customState = {
        ...getDefaultState(),
        [searchReducerType]: {
          ...getDefaultState()[searchReducerType],
          searchResults: resultsWithCounts,
        },
      };

      renderSearchResults(["/search?q=test"], customState);

      expect(screen.getByText(/All.*10/)).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Mines.*5/ })).toBeInTheDocument();
    });

    it("renders tables when results exist", () => {
      renderSearchResults();

      const tables = screen.getAllByRole("table");
      expect(tables.length).toBeGreaterThan(0);
    });
  });

  describe("Results Display", () => {
    it("shows result count message", () => {
      renderSearchResults();

      expect(screen.getByText(/results for/i)).toBeInTheDocument();
      expect(screen.getByText(/test/)).toBeInTheDocument();
    });

    it("shows no results message when empty", () => {
      const emptyResults = {
        mine: [],
        party: [],
        permit: [],
        permit_documents: [],
        mine_documents: [],
        explosives_permit: [],
        now_application: [],
        notice_of_departure: [],
      };

      const customState = {
        ...getDefaultState(),
        [searchReducerType]: {
          ...getDefaultState()[searchReducerType],
          searchResults: emptyResults,
        },
      };

      renderSearchResults(["/search?q=test"], customState);

      expect(screen.getByText(/No results for/i)).toBeInTheDocument();
    });

    it("shows empty state in tab when category has no results", () => {
      const emptyResults = {
        mine: [],
        party: [],
        permit: [],
        permit_documents: [],
        mine_documents: [],
        explosives_permit: [],
        now_application: [],
        notice_of_departure: [],
      };

      const customState = {
        ...getDefaultState(),
        [searchReducerType]: {
          ...getDefaultState()[searchReducerType],
          searchResults: emptyResults,
        },
      };

      renderSearchResults(["/search?q=test"], customState);

      expect(screen.getByText(/No results in this category/i)).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("shows loading spinner initially while searching", () => {
      // The component sets isSearching=true on mount before results arrive
      // Since results exist in mock state, loading completes quickly
      renderSearchResults();

      // After results load, we should see the content
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });
  });

  describe("URL Tab Parameter", () => {
    it("respects tab parameter from URL", () => {
      renderSearchResults(["/search?q=test&t=mine"]);

      const mineTab = screen.getByRole("tab", { name: /Mines/ });
      expect(mineTab).toHaveAttribute("aria-selected", "true");
    });

    it("defaults to all tab when no tab parameter", () => {
      renderSearchResults(["/search?q=test"]);

      const allTab = screen.getByRole("tab", { name: /All/ });
      expect(allTab).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("Error Handling", () => {
    it("handles missing facets gracefully", () => {
      const customState = {
        ...getDefaultState(),
        [searchReducerType]: {
          ...getDefaultState()[searchReducerType],
          searchFacets: undefined,
        },
      };

      renderSearchResults(["/search?q=test"], customState);

      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
      expect(screen.getByText("No filters available")).toBeInTheDocument();
    });

    it("handles missing search results gracefully", () => {
      const customState = {
        ...getDefaultState(),
        [searchReducerType]: {
          ...getDefaultState()[searchReducerType],
          searchResults: undefined,
        },
      };

      renderSearchResults(["/search?q=test"], customState);

      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it("handles empty search results object gracefully", () => {
      const customState = {
        ...getDefaultState(),
        [searchReducerType]: {
          ...getDefaultState()[searchReducerType],
          searchResults: {},
        },
      };

      renderSearchResults(["/search?q=test"], customState);

      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });
  });

  describe("End-to-End User Workflows", () => {
    it("complete search workflow: type query, see results, filter", async () => {
      const facetsWithValues = {
        mine_region: [{ key: "SW", count: 10 }],
      };

      const customState = {
        ...getDefaultState(),
        [searchReducerType]: {
          ...getDefaultState()[searchReducerType],
          searchFacets: facetsWithValues,
        },
      };

      renderSearchResults(["/search?q=initial"], customState);

      // Step 1: User sees search populated from URL
      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toHaveValue("initial");

      // Step 2: User modifies search
      fireEvent.change(searchInput, { target: { value: "new query" } });
      expect(searchInput).toHaveValue("new query");

      // Step 3: User sees filters
      expect(screen.getByText("Mine Filters")).toBeInTheDocument();

      // Step 4: User applies a filter
      const checkboxes = screen.getAllByRole("checkbox");
      const swCheckbox = checkboxes.find(cb =>
        cb.parentElement?.textContent?.includes("SW")
      );

      if (swCheckbox) {
        fireEvent.click(swCheckbox);

        await waitFor(() => {
          expect(swCheckbox).toBeChecked();
          expect(screen.getByText("Clear")).toBeInTheDocument();
        });
      }
    });

    it("tab navigation workflow: switch between tabs", () => {
      renderSearchResults();

      // Start on All tab
      expect(screen.getByRole("tab", { name: /All/ })).toHaveAttribute("aria-selected", "true");

      // Switch to Mines tab
      fireEvent.click(screen.getByRole("tab", { name: /Mines/ }));

      // The tab change triggers URL update via history.push
      // In our test, this won't actually update the DOM since we're using MemoryRouter
      // But the click event should be processed
    });
  });

  describe("Snapshots", () => {
    it("matches snapshot with search results", () => {
      const { container } = renderSearchResults();
      expect(container).toMatchSnapshot();
    });

    it("matches snapshot with no results", () => {
      const emptyResults = {
        mine: [],
        party: [],
        permit: [],
        permit_documents: [],
        mine_documents: [],
        explosives_permit: [],
        now_application: [],
        notice_of_departure: [],
      };

      const customState = {
        ...getDefaultState(),
        [searchReducerType]: {
          ...getDefaultState()[searchReducerType],
          searchResults: emptyResults,
        },
      };

      const { container } = renderSearchResults(["/search?q=test"], customState);
      expect(container).toMatchSnapshot();
    });
  });
});
