import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SearchResultsTabs } from "@/components/search/SearchResultsTabs";

const emptyResults = {
  mines: [],
  mineResults: [],
  peopleResults: [],
  organizationResults: [],
  permitResults: [],
  documentResults: [],
  explosivesPermitResults: [],
  explosivesPermits: [],
  nowApplicationResults: [],
  nowApplications: [],
  nodResults: [],
  nods: [],
  totalResults: 0,
};

const defaultProps = {
  activeTab: "all",
  onTabChange: jest.fn(),
  query: "test",
  highlightRegex: /test/i,
  partyRelationshipTypeHash: {},
  results: emptyResults,
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe("SearchResultsTabs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders without crashing", () => {
      const { container } = renderWithRouter(<SearchResultsTabs {...defaultProps} />);
      expect(container).toBeTruthy();
    });

    it("renders all tab labels", () => {
      renderWithRouter(<SearchResultsTabs {...defaultProps} />);

      expect(screen.getByRole("tab", { name: /All/ })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Mines/ })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /People/ })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Organizations/ })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Permits/ })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Explosives/ })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /NoW/ })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /NODs/ })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Documents/ })).toBeInTheDocument();
    });

    it("renders empty state when no results", () => {
      renderWithRouter(<SearchResultsTabs {...defaultProps} />);
      expect(screen.getByText(/No results in this category/i)).toBeInTheDocument();
    });

    it("displays zero counts in tab labels when no results", () => {
      renderWithRouter(<SearchResultsTabs {...defaultProps} />);

      // Check that tabs display with zero counts
      expect(screen.getByText(/All \(0\)/)).toBeInTheDocument();
      expect(screen.getByText(/Mines \(0\)/)).toBeInTheDocument();
      expect(screen.getByText(/People \(0\)/)).toBeInTheDocument();
    });
  });

  describe("Tab Selection", () => {
    it("highlights the active tab", () => {
      renderWithRouter(<SearchResultsTabs {...defaultProps} activeTab="mine" />);
      
      const mineTab = screen.getByRole("tab", { name: /Mines/ });
      expect(mineTab).toHaveAttribute("aria-selected", "true");
    });

    it("shows all tab as selected by default", () => {
      renderWithRouter(<SearchResultsTabs {...defaultProps} activeTab="all" />);
      
      const allTab = screen.getByRole("tab", { name: /All/ });
      expect(allTab).toHaveAttribute("aria-selected", "true");
    });

    it("calls onTabChange when a tab is clicked", () => {
      const mockOnTabChange = jest.fn();
      renderWithRouter(<SearchResultsTabs {...defaultProps} onTabChange={mockOnTabChange} />);

      const mineTab = screen.getByRole("tab", { name: /Mines/ });
      fireEvent.click(mineTab);

      expect(mockOnTabChange).toHaveBeenCalledWith("mine");
    });

    it("calls onTabChange with correct keys for different tabs", () => {
      const mockOnTabChange = jest.fn();
      renderWithRouter(<SearchResultsTabs {...defaultProps} onTabChange={mockOnTabChange} />);

      fireEvent.click(screen.getByRole("tab", { name: /People/ }));
      expect(mockOnTabChange).toHaveBeenCalledWith("people");

      fireEvent.click(screen.getByRole("tab", { name: /Permits/ }));
      expect(mockOnTabChange).toHaveBeenCalledWith("permit");

      fireEvent.click(screen.getByRole("tab", { name: /Documents/ }));
      expect(mockOnTabChange).toHaveBeenCalledWith("document");
    });
  });

  describe("Empty States", () => {
    it("shows empty state for all tab when no results", () => {
      renderWithRouter(<SearchResultsTabs {...defaultProps} activeTab="all" />);
      expect(screen.getByText(/No results in this category/i)).toBeInTheDocument();
    });

    it("shows empty state for mine tab when no mine results", () => {
      renderWithRouter(<SearchResultsTabs {...defaultProps} activeTab="mine" />);
      expect(screen.getByText(/No results in this category/i)).toBeInTheDocument();
    });

    it("shows empty state for people tab when no people results", () => {
      renderWithRouter(<SearchResultsTabs {...defaultProps} activeTab="people" />);
      expect(screen.getByText(/No results in this category/i)).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles null highlightRegex", () => {
      renderWithRouter(<SearchResultsTabs {...defaultProps} highlightRegex={null} />);
      expect(screen.getByRole("tab", { name: /All/ })).toBeInTheDocument();
    });

    it("handles empty query", () => {
      renderWithRouter(<SearchResultsTabs {...defaultProps} query="" />);
      expect(screen.getByRole("tab", { name: /All/ })).toBeInTheDocument();
    });

    it("handles undefined partyRelationshipTypeHash", () => {
      renderWithRouter(<SearchResultsTabs {...defaultProps} partyRelationshipTypeHash={undefined} />);
      expect(screen.getByRole("tab", { name: /All/ })).toBeInTheDocument();
    });
  });
});
