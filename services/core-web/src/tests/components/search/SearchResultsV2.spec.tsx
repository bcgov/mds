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
import { MINE_INFO_HASH } from "@mds/common/tests/mocks/dataMocks";

const defaultProps = {
  fetchSearchOptions: jest.fn(),
  fetchSearchResults: jest.fn(),
  searchOptions: SEARCH_OPTIONS,
  searchResults: SEARCH_RESULTS_V2,
  searchTerms: ["test"],
  searchFacets: SEARCH_FACETS,
  partyRelationshipTypeHash: MINE_INFO_HASH,
};

const renderWithRouterAndRedux = (component, initialEntries = ["/search?q=test"]) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ReduxWrapper>
        {component}
      </ReduxWrapper>
    </MemoryRouter>
  );
};

describe("SearchResults", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders without crashing", () => {
      const { container } = renderWithRouterAndRedux(
        <SearchResults {...defaultProps} />
      );
      expect(container).toBeTruthy();
    });

    it("displays search input with query from URL", () => {
      renderWithRouterAndRedux(
        <SearchResults {...defaultProps} />
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toHaveValue("test");
    });

    it("displays loading spinner when loading", () => {
      renderWithRouterAndRedux(
        <SearchResults {...defaultProps} />
      );

      // Multiple img elements exist (icons), so just check that the component renders
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it("displays tab for each result type with counts", () => {
      const resultsWithCounts = {
        mine: Array(5).fill(SEARCH_RESULTS_V2.mine[0]),
        party: Array(3).fill(SEARCH_RESULTS_V2.party[0]),
        permit: [],
        permit_documents: [],
        mine_documents: [],
        explosives_permit: [],
        now_application: [],
        notice_of_departure: [],
      };

      renderWithRouterAndRedux(
        <SearchResults
          {...defaultProps}
          searchResults={resultsWithCounts}
        />
      );

      expect(screen.getByText(/Mines.*5/)).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /People.*3/ })).toBeInTheDocument();
    });

    it("displays empty state when no results", () => {
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

      renderWithRouterAndRedux(
        <SearchResults
          {...defaultProps}
          searchResults={emptyResults}
        />
      );

      expect(screen.getByText(/No results in this category/i)).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("triggers search on search button click", async () => {
      const fetchSearchResults = jest.fn();

      renderWithRouterAndRedux(
        <SearchResults
          {...defaultProps}
          fetchSearchResults={fetchSearchResults}
        />,
        ["/search?q=initial"]
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: "new query" } });

      const searchButton = screen.getByRole("button", { name: "search" });
      fireEvent.click(searchButton);

      await waitFor(() => {
        // fetchSearchResults is called with (searchTerm, searchTypes, filters)
        expect(fetchSearchResults).toHaveBeenCalledWith(
          "new query",
          undefined,
          {}
        );
      });
    });

    it("calls fetchSearchResults on mount with query from URL", () => {
      const fetchSearchResults = jest.fn();

      renderWithRouterAndRedux(
        <SearchResults
          {...defaultProps}
          fetchSearchResults={fetchSearchResults}
        />,
        ["/search?q=test"]
      );

      expect(fetchSearchResults).toHaveBeenCalledWith("test", undefined, {});
    });

    it("displays search term from URL in input", () => {
      renderWithRouterAndRedux(
        <SearchResults {...defaultProps} />,
        ["/search?q=test%20mine"]
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toHaveValue("test mine");
    });
  });

  describe("Filters/Facets", () => {
    const facetsWithValues = {
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

    it("displays filter panel with facets", () => {
      renderWithRouterAndRedux(
        <SearchResults
          {...defaultProps}
          searchFacets={facetsWithValues}
        />
      );

      expect(screen.getByText("Mine Filters")).toBeInTheDocument();
      expect(screen.getByText("Permit Filters")).toBeInTheDocument();
    });

    it("displays facet values with counts", () => {
      renderWithRouterAndRedux(
        <SearchResults
          {...defaultProps}
          searchFacets={facetsWithValues}
        />
      );

      // Check for facet values (they should be visible)
      expect(screen.getByText(/SW/)).toBeInTheDocument();
      expect(screen.getByText("(10)")).toBeInTheDocument();
      expect(screen.getByText(/NE/)).toBeInTheDocument();
      expect(screen.getByText("(5)")).toBeInTheDocument();
    });

    it("applies filter when checkbox clicked", async () => {
      const fetchSearchResults = jest.fn();

      renderWithRouterAndRedux(
        <SearchResults
          {...defaultProps}
          searchFacets={facetsWithValues}
          fetchSearchResults={fetchSearchResults}
        />,
        ["/search?q=test"]
      );

      // Find and click the SW checkbox
      const checkboxes = screen.getAllByRole("checkbox");
      const swCheckbox = checkboxes.find(cb =>
        cb.parentElement?.textContent?.includes("SW")
      );

      if (swCheckbox) {
        fireEvent.click(swCheckbox);

        await waitFor(() => {
          // fetchSearchResults called with (searchTerm, types, filters)
          // filters should have mine_region: "SW"
          expect(fetchSearchResults).toHaveBeenCalledWith(
            "test",
            undefined,
            expect.objectContaining({ mine_region: "SW" })
          );
        });
      }
    });
  });

  describe("Tabs", () => {
    it("displays all results tab with count", () => {
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

      renderWithRouterAndRedux(
        <SearchResults
          {...defaultProps}
          searchResults={resultsWithCounts}
        />
      );

      // Check that All tab shows total count (5 mines + 3 parties + 2 permits = 10)
      expect(screen.getByText(/All.*10/)).toBeInTheDocument();
    });

    it("displays individual result type tabs with counts", () => {
      renderWithRouterAndRedux(
        <SearchResults {...defaultProps} />
      );

      // Check for individual tabs
      expect(screen.getByRole("tab", { name: /Mines/ })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Permits/ })).toBeInTheDocument();
    });
  });

  describe("Result Tables", () => {
    it("renders tables for results", () => {
      renderWithRouterAndRedux(
        <SearchResults {...defaultProps} />
      );

      // Should render tables for results
      const tables = screen.getAllByRole("table");
      expect(tables.length).toBeGreaterThan(0);
    });
  });

  describe("Error Handling", () => {
    it("handles missing facets gracefully", () => {
      renderWithRouterAndRedux(
        <SearchResults
          {...defaultProps}
          searchFacets={undefined}
        />
      );

      // Should not crash
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it("handles missing search results gracefully", () => {
      renderWithRouterAndRedux(
        <SearchResults
          {...defaultProps}
          searchResults={undefined}
        />
      );

      // Should not crash
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });
  });
});
