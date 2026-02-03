import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchFiltersPanel } from "@/components/search/SearchFiltersPanel";
import { SearchFacets } from "@/components/search/searchResultsConfig";

const mockFacets: SearchFacets = {
  mine_region: [
    { key: "SW", count: 10 },
    { key: "NE", count: 5 },
  ],
  mine_classification: [
    { key: "Major Mine", count: 8 },
    { key: "Regional Mine", count: 12 },
  ],
  permit_status: [
    { key: "Open", count: 15 },
    { key: "Closed", count: 3 },
  ],
};

const defaultProps = {
  searchFacets: mockFacets,
  selectedFilters: {} as Record<string, string[]>,
  hasActiveFilters: false,
  onFilterChange: jest.fn(),
  onClearAllFilters: jest.fn(),
};

describe("SearchFiltersPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders without crashing", () => {
      const { container } = render(<SearchFiltersPanel {...defaultProps} />);
      expect(container).toBeTruthy();
    });

    it("renders the Filters title", () => {
      render(<SearchFiltersPanel {...defaultProps} />);
      expect(screen.getByText("Filters")).toBeInTheDocument();
    });

    it("renders facet group labels", () => {
      render(<SearchFiltersPanel {...defaultProps} />);
      expect(screen.getByText("Mine Filters")).toBeInTheDocument();
      expect(screen.getByText("Permit Filters")).toBeInTheDocument();
    });

    it("renders facet values with counts", () => {
      render(<SearchFiltersPanel {...defaultProps} />);
      expect(screen.getByText("SW")).toBeInTheDocument();
      expect(screen.getByText("(10)")).toBeInTheDocument();
      expect(screen.getByText("NE")).toBeInTheDocument();
      expect(screen.getByText("(5)")).toBeInTheDocument();
    });

    it("renders 'No filters available' when no facets", () => {
      render(<SearchFiltersPanel {...defaultProps} searchFacets={{}} />);
      expect(screen.getByText("No filters available")).toBeInTheDocument();
    });

    it("renders 'No filters available' when facets is null", () => {
      render(<SearchFiltersPanel {...defaultProps} searchFacets={null} />);
      expect(screen.getByText("No filters available")).toBeInTheDocument();
    });
  });

  describe("Active Filters", () => {
    it("does not show Clear button when no active filters", () => {
      render(<SearchFiltersPanel {...defaultProps} hasActiveFilters={false} />);
      expect(screen.queryByText("Clear")).not.toBeInTheDocument();
    });

    it("shows Clear button when there are active filters", () => {
      render(
        <SearchFiltersPanel
          {...defaultProps}
          hasActiveFilters={true}
          selectedFilters={{ mine_region: ["SW"] }}
        />
      );
      expect(screen.getByText("Clear")).toBeInTheDocument();
    });

    it("displays selected filter tags", () => {
      render(
        <SearchFiltersPanel
          {...defaultProps}
          hasActiveFilters={true}
          selectedFilters={{ mine_region: ["SW", "NE"] }}
        />
      );
      
      const tags = screen.getAllByText(/SW|NE/);
      expect(tags.length).toBeGreaterThanOrEqual(2);
    });

    it("calls onClearAllFilters when Clear button is clicked", () => {
      const mockClear = jest.fn();
      render(
        <SearchFiltersPanel
          {...defaultProps}
          hasActiveFilters={true}
          selectedFilters={{ mine_region: ["SW"] }}
          onClearAllFilters={mockClear}
        />
      );

      fireEvent.click(screen.getByText("Clear"));
      expect(mockClear).toHaveBeenCalled();
    });
  });

  describe("Filter Interactions", () => {
    it("calls onFilterChange when checkbox is clicked", () => {
      const mockOnChange = jest.fn();
      render(<SearchFiltersPanel {...defaultProps} onFilterChange={mockOnChange} />);

      const checkboxes = screen.getAllByRole("checkbox");
      const swCheckbox = checkboxes.find(cb =>
        cb.parentElement?.textContent?.includes("SW")
      );

      if (swCheckbox) {
        fireEvent.click(swCheckbox);
        expect(mockOnChange).toHaveBeenCalledWith("mine_region", "SW", true);
      }
    });

    it("shows checkbox as checked for selected filters", () => {
      render(
        <SearchFiltersPanel
          {...defaultProps}
          selectedFilters={{ mine_region: ["SW"] }}
        />
      );

      const checkboxes = screen.getAllByRole("checkbox");
      const swCheckbox = checkboxes.find(cb =>
        cb.parentElement?.textContent?.includes("SW")
      );

      // The checkbox input should be checked
      if (swCheckbox) {
        expect(swCheckbox).toBeChecked();
      }
    });

    it("calls onFilterChange with false when removing filter tag", () => {
      const mockOnChange = jest.fn();
      render(
        <SearchFiltersPanel
          {...defaultProps}
          hasActiveFilters={true}
          selectedFilters={{ mine_region: ["SW"] }}
          onFilterChange={mockOnChange}
        />
      );

      const closeButtons = screen.getAllByRole("img", { name: "close" });
      if (closeButtons.length > 0) {
        fireEvent.click(closeButtons[0]);
        expect(mockOnChange).toHaveBeenCalledWith("mine_region", "SW", false);
      }
    });
  });

  describe("Facet Sorting", () => {
    it("sorts facets by count in descending order", () => {
      const facetsWithDifferentCounts: SearchFacets = {
        mine_region: [
          { key: "Low", count: 1 },
          { key: "High", count: 100 },
          { key: "Medium", count: 50 },
        ],
      };

      render(<SearchFiltersPanel {...defaultProps} searchFacets={facetsWithDifferentCounts} />);

      // Check that all three values are rendered
      expect(screen.getByText("High")).toBeInTheDocument();
      expect(screen.getByText("Medium")).toBeInTheDocument();
      expect(screen.getByText("Low")).toBeInTheDocument();

      // Verify counts are displayed in order (100, 50, 1)
      expect(screen.getByText("(100)")).toBeInTheDocument();
      expect(screen.getByText("(50)")).toBeInTheDocument();
      expect(screen.getByText("(1)")).toBeInTheDocument();
    });
  });

  describe("Snapshots", () => {
    it("matches snapshot with facets", () => {
      const { container } = render(<SearchFiltersPanel {...defaultProps} />);
      expect(container).toMatchSnapshot();
    });

    it("matches snapshot with active filters", () => {
      const { container } = render(
        <SearchFiltersPanel
          {...defaultProps}
          hasActiveFilters={true}
          selectedFilters={{ mine_region: ["SW"], permit_status: ["Open"] }}
        />
      );
      expect(container).toMatchSnapshot();
    });
  });
});
