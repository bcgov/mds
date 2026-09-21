import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchFilters } from "@/components/search/GlobalSearch/components/SearchFilters";

const mockFacets = {
  mine: 10,
  person: 5,
  organization: 3,
  permit: 8,
  explosives_permit: 2,
  now_application: 4,
  nod: 1,
  mine_documents: 15,
  permit_documents: 7,
};

const defaultProps = {
  activeFilters: [] as string[],
  onToggleFilter: jest.fn(),
  facets: mockFacets,
  isOnMinePage: false,
  scopeToMine: false,
  onToggleScopeToMine: jest.fn(),
  searchTerm: "test",
};

describe("SearchFilters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders without crashing", () => {
      const { container } = render(<SearchFilters {...defaultProps} />);
      expect(container).toBeTruthy();
    });

    it("matches snapshot", () => {
      const { container } = render(<SearchFilters {...defaultProps} />);
      expect(container).toMatchSnapshot();
    });

    it("matches snapshot when on mine page", () => {
      const { container } = render(
        <SearchFilters {...defaultProps} isOnMinePage={true} scopeToMine={true} />
      );
      expect(container).toMatchSnapshot();
    });

    it("renders all filter tags", () => {
      render(<SearchFilters {...defaultProps} />);

      expect(screen.getByText("Mines")).toBeInTheDocument();
      expect(screen.getByText("People")).toBeInTheDocument();
      expect(screen.getByText("Organizations")).toBeInTheDocument();
      expect(screen.getByText("Permits")).toBeInTheDocument();
      expect(screen.getByText("Explosives")).toBeInTheDocument();
      expect(screen.getByText("NoW")).toBeInTheDocument();
      expect(screen.getByText("NODs")).toBeInTheDocument();
      expect(screen.getByText("Documents")).toBeInTheDocument();
    });

    it("renders facet counts for each filter", () => {
      render(<SearchFilters {...defaultProps} />);

      expect(screen.getByText("(10)")).toBeInTheDocument(); // mines
      expect(screen.getByText("(5)")).toBeInTheDocument(); // people
      expect(screen.getByText("(3)")).toBeInTheDocument(); // organizations
      expect(screen.getByText("(8)")).toBeInTheDocument(); // permits
      expect(screen.getByText("(2)")).toBeInTheDocument(); // explosives
      expect(screen.getByText("(4)")).toBeInTheDocument(); // now_application
      expect(screen.getByText("(1)")).toBeInTheDocument(); // nod
      expect(screen.getByText("(22)")).toBeInTheDocument(); // documents (15 + 7)
    });

    it("does not render count for filters with zero results", () => {
      const emptyFacets = { ...mockFacets, mine: 0 };
      render(<SearchFilters {...defaultProps} facets={emptyFacets} />);

      expect(screen.getByText("Mines")).toBeInTheDocument();
      expect(screen.queryByText("(0)")).not.toBeInTheDocument();
    });
  });

  describe("Mine Page Scope", () => {
    it("does not render 'This Mine' tag when not on mine page", () => {
      render(<SearchFilters {...defaultProps} isOnMinePage={false} />);

      expect(screen.queryByText("This Mine")).not.toBeInTheDocument();
    });

    it("renders 'This Mine' tag when on mine page", () => {
      render(<SearchFilters {...defaultProps} isOnMinePage={true} />);

      expect(screen.getByText("This Mine")).toBeInTheDocument();
    });

    it("renders divider when on mine page", () => {
      const { container } = render(<SearchFilters {...defaultProps} isOnMinePage={true} />);

      const divider = container.querySelector(".ant-divider");
      expect(divider).toBeInTheDocument();
    });

    it("does not render divider when not on mine page", () => {
      const { container } = render(<SearchFilters {...defaultProps} isOnMinePage={false} />);

      const divider = container.querySelector(".ant-divider");
      expect(divider).not.toBeInTheDocument();
    });

    it("calls onToggleScopeToMine when 'This Mine' tag is clicked", () => {
      const mockOnToggleScopeToMine = jest.fn();
      render(
        <SearchFilters
          {...defaultProps}
          isOnMinePage={true}
          onToggleScopeToMine={mockOnToggleScopeToMine}
        />
      );

      const thisMineTag = screen.getByText("This Mine").closest(".ant-tag");
      fireEvent.click(thisMineTag!);

      expect(mockOnToggleScopeToMine).toHaveBeenCalledWith(true);
    });

    it("shows 'This Mine' as checked when scopeToMine is true", () => {
      const { container } = render(
        <SearchFilters {...defaultProps} isOnMinePage={true} scopeToMine={true} />
      );

      const thisMineTag = container.querySelector(".search-filters__tag--mine-scope");
      expect(thisMineTag).toHaveClass("checked");
    });
  });

  describe("Filter Interactions", () => {
    it("calls onToggleFilter when a filter tag is clicked", () => {
      const mockOnToggleFilter = jest.fn();
      render(<SearchFilters {...defaultProps} onToggleFilter={mockOnToggleFilter} />);

      const minesTag = screen.getByText("Mines").closest(".ant-tag");
      fireEvent.click(minesTag!);

      expect(mockOnToggleFilter).toHaveBeenCalledWith("mine");
    });

    it("calls onToggleFilter with correct key for each filter type", () => {
      const mockOnToggleFilter = jest.fn();
      render(<SearchFilters {...defaultProps} onToggleFilter={mockOnToggleFilter} />);

      // Click on People filter
      const peopleTag = screen.getByText("People").closest(".ant-tag");
      fireEvent.click(peopleTag!);
      expect(mockOnToggleFilter).toHaveBeenCalledWith("contact");

      // Click on Permits filter
      const permitsTag = screen.getByText("Permits").closest(".ant-tag");
      fireEvent.click(permitsTag!);
      expect(mockOnToggleFilter).toHaveBeenCalledWith("permit");
    });

    it("applies active styling to selected filters", () => {
      const { container } = render(
        <SearchFilters {...defaultProps} activeFilters={["mine", "permit"]} />
      );

      const tags = container.querySelectorAll(".ant-tag-checkable-checked");
      expect(tags.length).toBe(2);
    });
  });

  describe("Edge Cases", () => {
    it("handles empty facets object", () => {
      render(<SearchFilters {...defaultProps} facets={{}} />);

      expect(screen.getByText("Mines")).toBeInTheDocument();
      expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
    });

    it("handles undefined facet values gracefully", () => {
      const partialFacets = { mine: 5 };
      render(<SearchFilters {...defaultProps} facets={partialFacets} />);

      expect(screen.getByText("Mines")).toBeInTheDocument();
      expect(screen.getByText("(5)")).toBeInTheDocument();
    });

    it("renders with empty active filters array", () => {
      const { container } = render(<SearchFilters {...defaultProps} activeFilters={[]} />);

      const checkedTags = container.querySelectorAll(".ant-tag-checkable-checked");
      expect(checkedTags.length).toBe(0);
    });

    it("combines mine_documents and permit_documents counts for document filter", () => {
      const facetsWithDocs = {
        ...mockFacets,
        mine_documents: 100,
        permit_documents: 50,
      };
      render(<SearchFilters {...defaultProps} facets={facetsWithDocs} />);

      expect(screen.getByText("(150)")).toBeInTheDocument();
    });
  });
});
