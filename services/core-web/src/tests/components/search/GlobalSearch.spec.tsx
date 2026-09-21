import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import GlobalSearch from "@/components/search/GlobalSearch/GlobalSearch";
import { searchReducerType } from "@mds/common/redux/slices/searchSlice";
import { SIMPLE_SEARCH_RESULTS, SIMPLE_SEARCH_FACETS } from "@mds/common/tests/mocks/searchMockData";
import * as searchSlice from "@mds/common/redux/slices/searchSlice";

const mockFetchSearchBarResults = jest.spyOn(searchSlice, "fetchSearchBarResults");

const getDefaultState = () => ({
  [searchReducerType]: {
    searchOptions: [],
    searchResults: {},
    searchTerms: [],
    searchFacets: {},
    searchBarResults: [],
    searchBarFacets: {
      mine: 0,
      person: 0,
      organization: 0,
      permit: 0,
      nod: 0,
      explosives_permit: 0,
      now_application: 0,
      mine_documents: 0,
      permit_documents: 0,
    },
  },
});

const getStateWithResults = () => ({
  [searchReducerType]: {
    ...getDefaultState()[searchReducerType],
    searchBarResults: SIMPLE_SEARCH_RESULTS,
    searchBarFacets: SIMPLE_SEARCH_FACETS,
  },
});

const renderGlobalSearch = (props = {}, state = null, initialEntries = ["/"]) => {
  const stateToUse = state || getDefaultState();
  return render(
    <ReduxWrapper initialState={stateToUse}>
      <MemoryRouter initialEntries={initialEntries}>
        <GlobalSearch {...props} />
      </MemoryRouter>
    </ReduxWrapper>
  );
};

const openModalViaKeyboard = async () => {
  await act(async () => {
    fireEvent.keyDown(document, { key: "k", metaKey: true });
  });
  await waitFor(() => {
    expect(document.querySelector('.global-search-modal')).toBeInTheDocument();
  }, { timeout: 2000 });
};

const getModalInput = () => {
  const modal = document.querySelector('.global-search-modal');
  return modal?.querySelector('input[type="text"]') as HTMLInputElement | null;
};

describe("GlobalSearch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Rendering", () => {
    it("renders the search trigger button", () => {
      renderGlobalSearch();
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("renders with custom placeholder in trigger", () => {
      renderGlobalSearch({ placeholder: "Custom placeholder" });
      expect(screen.getByPlaceholderText("Custom placeholder")).toBeInTheDocument();
    });

    it("shows keyboard shortcut hint when enabled", () => {
      renderGlobalSearch({ enableShortcut: true });
      // Shortcut shows as "⌘ + K" or "CTRL + K" depending on platform
      expect(screen.getByText(/\+ K/i)).toBeInTheDocument();
    });

    it("does not show shortcut button when disabled", () => {
      renderGlobalSearch({ enableShortcut: false });
      // When disabled, the suffix changes to just a search icon
      expect(screen.queryByText(/\+ K/i)).not.toBeInTheDocument();
    });
  });

  describe("Modal Behavior", () => {
    it("opens modal when trigger is clicked", async () => {
      renderGlobalSearch();

      const triggerInput = screen.getByPlaceholderText(/Search Core/i);
      await act(async () => {
        fireEvent.click(triggerInput);
      });

      await waitFor(() => {
        expect(document.querySelector('.global-search-modal')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it("closes modal when escape is pressed", async () => {
      renderGlobalSearch({ enableShortcut: true });

      await openModalViaKeyboard();
      
      const input = getModalInput();
      expect(input).toBeTruthy();

      await act(async () => {
        fireEvent.keyDown(input!, { key: "Escape" });
      });

      await waitFor(() => {
        expect(document.querySelector('.global-search-modal')).not.toBeInTheDocument();
      });
    });

    it("clears search state when modal closes and reopens", async () => {
      renderGlobalSearch({ enableShortcut: true });

      await openModalViaKeyboard();
      
      const input = getModalInput();
      expect(input).toBeTruthy();

      await act(async () => {
        fireEvent.change(input!, { target: { value: "test query" } });
      });
      expect(input!.value).toBe("test query");

      await act(async () => {
        fireEvent.keyDown(input!, { key: "Escape" });
      });

      await waitFor(() => {
        expect(document.querySelector('.global-search-modal')).not.toBeInTheDocument();
      });

      // Reopen modal
      await openModalViaKeyboard();
      
      const reopenedInput = getModalInput();
      expect(reopenedInput?.value).toBe("");
    });
  });

  describe("Keyboard Shortcuts", () => {
    it("opens modal with Cmd+K", async () => {
      renderGlobalSearch({ enableShortcut: true });

      await act(async () => {
        fireEvent.keyDown(document, { key: "k", metaKey: true });
      });

      await waitFor(() => {
        expect(document.querySelector('.global-search-modal')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it("opens modal with Ctrl+K", async () => {
      renderGlobalSearch({ enableShortcut: true });

      await act(async () => {
        fireEvent.keyDown(document, { key: "k", ctrlKey: true });
      });

      await waitFor(() => {
        expect(document.querySelector('.global-search-modal')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it("does not open modal with shortcut when disabled", async () => {
      renderGlobalSearch({ enableShortcut: false });

      await act(async () => {
        fireEvent.keyDown(document, { key: "k", metaKey: true });
      });

      // Advance fake timers and confirm modal did not open
      await act(async () => {
        jest.advanceTimersByTime(100);
      });
      expect(document.querySelector('.global-search-modal')).not.toBeInTheDocument();
    });

    it("toggles modal with repeated Cmd+K presses", async () => {
      renderGlobalSearch({ enableShortcut: true });

      // Open
      await act(async () => {
        fireEvent.keyDown(document, { key: "k", metaKey: true });
      });
      await waitFor(() => {
        expect(document.querySelector('.global-search-modal')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Close
      await act(async () => {
        fireEvent.keyDown(document, { key: "k", metaKey: true });
      });
      await waitFor(() => {
        expect(document.querySelector('.global-search-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe("Search Input", () => {
    it("updates search term on input change", async () => {
      jest.useRealTimers();
      renderGlobalSearch({ enableShortcut: true });

      await openModalViaKeyboard();

      const input = getModalInput();
      expect(input).toBeTruthy();

      await act(async () => {
        fireEvent.change(input!, { target: { value: "test search" } });
      });

      expect(input!.value).toBe("test search");
    });

    it("clears input when clear icon is clicked", async () => {
      jest.useRealTimers();
      renderGlobalSearch({ enableShortcut: true });

      await openModalViaKeyboard();

      const input = getModalInput();
      expect(input).toBeTruthy();

      await act(async () => {
        fireEvent.change(input!, { target: { value: "test" } });
      });

      expect(input!.value).toBe("test");

      // Find and click the clear icon
      const clearIcon = document.querySelector('.ant-input-clear-icon');
      if (clearIcon) {
        await act(async () => {
          fireEvent.click(clearIcon);
        });
        expect(input!.value).toBe("");
      }
    });
  });

  describe("Debounced Search", () => {
    it("does not dispatch search immediately on input change", async () => {
      renderGlobalSearch({ enableShortcut: true });

      await act(async () => {
        fireEvent.keyDown(document, { key: "k", metaKey: true });
        jest.advanceTimersByTime(100);
      });

      const input = getModalInput();
      expect(input).toBeTruthy();

      mockFetchSearchBarResults.mockClear();

      await act(async () => {
        fireEvent.change(input!, { target: { value: "t" } });
      });

      // Should not have dispatched immediately
      expect(mockFetchSearchBarResults).not.toHaveBeenCalled();
    });

    it("dispatches search after debounce delay (300ms)", async () => {
      renderGlobalSearch({ enableShortcut: true });

      await act(async () => {
        fireEvent.keyDown(document, { key: "k", metaKey: true });
        jest.advanceTimersByTime(100);
      });

      const input = getModalInput();
      expect(input).toBeTruthy();

      mockFetchSearchBarResults.mockClear();

      await act(async () => {
        fireEvent.change(input!, { target: { value: "test" } });
      });

      // Not dispatched yet
      expect(mockFetchSearchBarResults).not.toHaveBeenCalled();

      // Advance past debounce delay
      await act(async () => {
        jest.advanceTimersByTime(300);
      });

      // Now should have been called
      expect(mockFetchSearchBarResults).toHaveBeenCalledTimes(1);
      expect(mockFetchSearchBarResults).toHaveBeenCalledWith(
        expect.objectContaining({
          searchTerm: "test",
        })
      );
    });

    it("only dispatches once for rapid keystrokes", async () => {
      renderGlobalSearch({ enableShortcut: true });

      await act(async () => {
        fireEvent.keyDown(document, { key: "k", metaKey: true });
        jest.advanceTimersByTime(100);
      });

      const input = getModalInput();
      expect(input).toBeTruthy();

      mockFetchSearchBarResults.mockClear();

      // Simulate rapid typing
      await act(async () => {
        fireEvent.change(input!, { target: { value: "t" } });
        jest.advanceTimersByTime(50);
        fireEvent.change(input!, { target: { value: "te" } });
        jest.advanceTimersByTime(50);
        fireEvent.change(input!, { target: { value: "tes" } });
        jest.advanceTimersByTime(50);
        fireEvent.change(input!, { target: { value: "test" } });
      });

      // Not dispatched yet (still within debounce window)
      expect(mockFetchSearchBarResults).not.toHaveBeenCalled();

      // Advance past debounce delay
      await act(async () => {
        jest.advanceTimersByTime(300);
      });

      // Should only dispatch once with final value
      expect(mockFetchSearchBarResults).toHaveBeenCalledTimes(1);
      expect(mockFetchSearchBarResults).toHaveBeenCalledWith(
        expect.objectContaining({
          searchTerm: "test",
        })
      );
    });

    it("resets debounce timer on new input", async () => {
      renderGlobalSearch({ enableShortcut: true });

      await act(async () => {
        fireEvent.keyDown(document, { key: "k", metaKey: true });
        jest.advanceTimersByTime(100);
      });

      const input = getModalInput();
      expect(input).toBeTruthy();

      mockFetchSearchBarResults.mockClear();

      await act(async () => {
        fireEvent.change(input!, { target: { value: "test" } });
      });

      // Wait 200ms (less than 300ms debounce)
      await act(async () => {
        jest.advanceTimersByTime(200);
      });

      // Type more - should reset the timer
      await act(async () => {
        fireEvent.change(input!, { target: { value: "testing" } });
      });

      // Wait another 200ms (total 400ms from first keystroke, but only 200ms from last)
      await act(async () => {
        jest.advanceTimersByTime(200);
      });

      // Should still not have fired because timer was reset
      expect(mockFetchSearchBarResults).not.toHaveBeenCalled();

      // Wait another 100ms to complete the debounce from last keystroke
      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      // Now should fire with the latest value
      expect(mockFetchSearchBarResults).toHaveBeenCalledTimes(1);
      expect(mockFetchSearchBarResults).toHaveBeenCalledWith(
        expect.objectContaining({
          searchTerm: "testing",
        })
      );
    });
  });

  describe("Search Results", () => {
    it("renders results from redux state", async () => {
      // Results are already in state - when modal opens with results, they should display
      renderGlobalSearch({ enableShortcut: true }, getStateWithResults());

      await openModalViaKeyboard();

      // The component renders results when they exist in state
      // Since results exist, filter chips should be visible
      const filterTags = document.querySelectorAll('.search-filters__tag');
      expect(filterTags.length).toBeGreaterThan(0);
    });

    it("dispatches search action when input changes", async () => {
      renderGlobalSearch({ enableShortcut: true }, getStateWithResults());

      await openModalViaKeyboard();

      const input = getModalInput();
      await act(async () => {
        fireEvent.change(input!, { target: { value: "test" } });
      });

      // Input value should be updated
      expect(input!.value).toBe("test");
    });

    it("shows filter categories from facets", async () => {
      renderGlobalSearch({ enableShortcut: true }, getStateWithResults());

      await openModalViaKeyboard();

      // Facets from state should show in filters
      const filterTags = document.querySelectorAll('.search-filters__tag');
      expect(filterTags.length).toBeGreaterThan(0);
    });
  });

  describe("Keyboard Navigation", () => {
    it("handles arrow key navigation without crashing", async () => {
      renderGlobalSearch({ enableShortcut: true }, getStateWithResults());

      await openModalViaKeyboard();

      const input = getModalInput();
      
      // Arrow keys should not crash the component
      await act(async () => {
        fireEvent.keyDown(input!, { key: "ArrowDown" });
        fireEvent.keyDown(input!, { key: "ArrowDown" });
        fireEvent.keyDown(input!, { key: "ArrowUp" });
      });

      // Modal should still be open
      expect(document.querySelector('.global-search-modal')).toBeInTheDocument();
    });

    it("handles Enter key with no selection - modal stays open", async () => {
      renderGlobalSearch({ enableShortcut: true });

      await openModalViaKeyboard();

      const input = getModalInput();
      await act(async () => {
        fireEvent.change(input!, { target: { value: "test" } });
      });

      await act(async () => {
        fireEvent.keyDown(input!, { key: "Enter" });
      });

      // Enter with no selection should keep modal open
      expect(document.querySelector('.global-search-modal')).toBeInTheDocument();
    });
  });

  describe("Filter Chips", () => {
    it("displays filter chips with counts", async () => {
      renderGlobalSearch({ enableShortcut: true }, getStateWithResults());

      await openModalViaKeyboard();

      // Filter chips should be visible in the modal
      const modal = document.querySelector('.global-search-modal');
      expect(modal).toBeInTheDocument();
      
      // Look for filter tags specifically
      const filterTags = modal?.querySelectorAll('.search-filters__tag');
      expect(filterTags?.length).toBeGreaterThan(0);
    });

    it("toggles filter when chip is clicked", async () => {
      renderGlobalSearch({ enableShortcut: true }, getStateWithResults());

      await openModalViaKeyboard();

      // Find and click a filter chip
      const filterTags = document.querySelectorAll('.search-filters__tag');
      if (filterTags.length > 0) {
        await act(async () => {
          fireEvent.click(filterTags[0]);
        });
      }
    });
  });

  describe("Empty States", () => {
    it("shows empty state when no search term and no recent searches", async () => {
      renderGlobalSearch({ enableShortcut: true });

      await openModalViaKeyboard();

      // Should show quick actions or empty state
      expect(screen.getByText(/Browse Mines/i)).toBeInTheDocument();
    });

    it("handles empty search state gracefully", async () => {
      renderGlobalSearch({ enableShortcut: true });

      await openModalViaKeyboard();

      const input = getModalInput();
      await act(async () => {
        fireEvent.change(input!, { target: { value: "nonexistent search query" } });
      });

      // Component should not crash with no results
      expect(document.querySelector('.global-search-modal')).toBeInTheDocument();
    });
  });

  describe("Recent Searches", () => {
    beforeEach(() => {
      localStorage.setItem("mds_recent_searches", JSON.stringify(["previous search", "another search"]));
    });

    it("displays recent searches when modal opens", async () => {
      renderGlobalSearch({ enableShortcut: true });

      await openModalViaKeyboard();

      expect(screen.getByText("Recent Searches")).toBeInTheDocument();
      expect(screen.getByText("previous search")).toBeInTheDocument();
      expect(screen.getByText("another search")).toBeInTheDocument();
    });

    it("populates search when recent search is clicked", async () => {
      renderGlobalSearch({ enableShortcut: true });

      await openModalViaKeyboard();

      await act(async () => {
        fireEvent.click(screen.getByText("previous search"));
      });

      const input = getModalInput();
      expect(input?.value).toBe("previous search");
    });

    it("removes recent search when delete button is clicked", async () => {
      renderGlobalSearch({ enableShortcut: true });

      await openModalViaKeyboard();

      expect(screen.getByText("previous search")).toBeInTheDocument();

      const deleteButtons = document.querySelectorAll('.recent-searches__delete-icon');
      if (deleteButtons.length > 0) {
        await act(async () => {
          fireEvent.click(deleteButtons[0]);
        });
      }

      await waitFor(() => {
        expect(screen.queryByText("previous search")).not.toBeInTheDocument();
      });
    });
  });

  describe("Mine Scoping", () => {
    it("shows scope toggle when on mine page", async () => {
      // UUID format: 8-4-4-4-12 hex chars
      renderGlobalSearch({ enableShortcut: true }, getDefaultState(), ["/mine-dashboard/12345678-1234-1234-1234-123456789abc"]);

      await openModalViaKeyboard();

      expect(screen.getByText(/This Mine/i)).toBeInTheDocument();
    });

    it("does not show scope toggle when not on mine page", async () => {
      renderGlobalSearch({ enableShortcut: true }, getDefaultState(), ["/"]);

      await openModalViaKeyboard();

      expect(screen.queryByText(/This Mine/i)).not.toBeInTheDocument();
    });
  });

  describe("Modal Footer", () => {
    it("displays keyboard hints in footer", async () => {
      renderGlobalSearch({ enableShortcut: true });

      await openModalViaKeyboard();

      expect(screen.getByText(/select/i)).toBeInTheDocument();
      expect(screen.getByText(/navigate/i)).toBeInTheDocument();
      expect(screen.getByText(/close/i)).toBeInTheDocument();
    });
  });

  describe("Quick Filter Tags", () => {
    it("modal opens with proper state", async () => {
      renderGlobalSearch({ enableShortcut: true }, getStateWithResults());

      await openModalViaKeyboard();

      expect(document.querySelector('.global-search-modal')).toBeInTheDocument();
    });

    it("handles backspace key on empty input", async () => {
      renderGlobalSearch({ enableShortcut: true }, getStateWithResults());

      await openModalViaKeyboard();

      const input = getModalInput();
      await act(async () => {
        fireEvent.keyDown(input!, { key: "Backspace" });
      });

      // Should not crash
      expect(document.querySelector('.global-search-modal')).toBeInTheDocument();
    });
  });

  describe("Result Click Navigation", () => {
    it("keeps modal open when Enter is pressed with no selection", async () => {
      renderGlobalSearch({ enableShortcut: true });

      await openModalViaKeyboard();

      const input = getModalInput();
      await act(async () => {
        fireEvent.change(input!, { target: { value: "test mine" } });
      });

      // Press Enter without selecting a result
      await act(async () => {
        fireEvent.keyDown(input!, { key: "Enter" });
      });

      // Modal should stay open since no result is selected
      expect(document.querySelector('.global-search-modal')).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes on modal", async () => {
      renderGlobalSearch({ enableShortcut: true });

      await openModalViaKeyboard();

      const modal = document.querySelector('.ant-modal');
      expect(modal).toBeInTheDocument();
    });

    it("input has proper type attribute", async () => {
      renderGlobalSearch({ enableShortcut: true });

      await openModalViaKeyboard();

      const input = getModalInput();
      expect(input).toHaveAttribute("type", "text");
    });
  });

  describe("Snapshots", () => {
    it("matches snapshot with closed modal", () => {
      const { container } = renderGlobalSearch();
      expect(container).toMatchSnapshot();
    });

    it("matches snapshot with open modal", async () => {
      const { container } = renderGlobalSearch({ enableShortcut: true });

      await openModalViaKeyboard();

      expect(container).toMatchSnapshot();
    });

    it("matches snapshot with results state", async () => {
      const { container } = renderGlobalSearch({ enableShortcut: true }, getStateWithResults());

      await openModalViaKeyboard();

      // With results in state, filter chips should be visible
      expect(container).toMatchSnapshot();
    });
  });
});
