import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchHeader } from "@/components/search/SearchHeader";

const defaultProps = {
  searchInputValue: "",
  onSearchInputChange: jest.fn(),
  onSearch: jest.fn(),
};

describe("SearchHeader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders without crashing", () => {
      const { container } = render(<SearchHeader {...defaultProps} />);
      expect(container).toBeTruthy();
    });

    it("renders the title", () => {
      render(<SearchHeader {...defaultProps} />);
      expect(screen.getByRole("heading", { name: /search results/i })).toBeInTheDocument();
    });

    it("renders the search input", () => {
      render(<SearchHeader {...defaultProps} />);
      expect(screen.getByPlaceholderText(/search for mines, contacts, permits/i)).toBeInTheDocument();
    });

    it("displays the current search value", () => {
      render(<SearchHeader {...defaultProps} searchInputValue="test query" />);
      expect(screen.getByDisplayValue("test query")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("calls onSearchInputChange when typing", () => {
      const mockOnChange = jest.fn();
      render(<SearchHeader {...defaultProps} onSearchInputChange={mockOnChange} />);

      const input = screen.getByPlaceholderText(/search for mines, contacts, permits/i);
      fireEvent.change(input, { target: { value: "new query" } });

      expect(mockOnChange).toHaveBeenCalledWith("new query");
    });

    it("calls onSearch when search button is clicked", () => {
      const mockOnSearch = jest.fn();
      render(<SearchHeader {...defaultProps} searchInputValue="test" onSearch={mockOnSearch} />);

      const searchButton = screen.getByRole("button", { name: "search" });
      fireEvent.click(searchButton);

      expect(mockOnSearch).toHaveBeenCalled();
    });

    it("calls onSearch when Enter is pressed", () => {
      const mockOnSearch = jest.fn();
      render(<SearchHeader {...defaultProps} searchInputValue="test" onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText(/search for mines, contacts, permits/i);
      fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

      expect(mockOnSearch).toHaveBeenCalled();
    });
  });

  describe("Snapshots", () => {
    it("matches snapshot with empty value", () => {
      const { container } = render(<SearchHeader {...defaultProps} />);
      expect(container).toMatchSnapshot();
    });

    it("matches snapshot with search value", () => {
      const { container } = render(<SearchHeader {...defaultProps} searchInputValue="test query" />);
      expect(container).toMatchSnapshot();
    });
  });
});
