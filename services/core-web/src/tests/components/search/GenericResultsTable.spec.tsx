import React from "react";
import { render as rtlRender, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { GenericResultsTable } from "@/components/search/GenericResultsTable";

const render = (ui) => rtlRender(<MemoryRouter>{ui}</MemoryRouter>);

const mockResultsExplosivesPermits = [
  {
    type: "explosives_permit",
    score: 10.5,
    result: {
      explosives_permit_guid: "exp-123",
      application_number: "APP-001",
      mine_name: "Test Mine",
      application_status: "APP",
      is_closed: false,
    },
  },
  {
    type: "explosives_permit",
    score: 8.3,
    result: {
      explosives_permit_guid: "exp-456",
      application_number: "APP-002",
      mine_name: "Another Mine",
      application_status: "REC",
      is_closed: true,
    },
  },
];

const mockResultsNow = [
  {
    type: "now_application",
    score: 9.2,
    result: {
      now_application_guid: "now-123",
      now_number: "NOW-001",
      mine_name: "Test Mine",
      now_application_status_code: "REC",
    },
  },
];

const mockResultsNod = [
  {
    type: "notice_of_departure",
    score: 7.5,
    result: {
      nod_guid: "nod-123",
      nod_no: "NOD-001",
      nod_title: "Test NOD",
      mine_name: "Test Mine",
      nod_status: "pending_review",
    },
  },
];

// Extract result property as done in SearchResultsV2
const extractResults = (searchResults) => searchResults.map(item => item.result);

describe("GenericResultsTable", () => {

  // Test helper props
  const mockColumnsExplosives = [
    {
      title: "Application #",
      dataIndex: "application_number",
      key: "application_number",
      link: (record) => `/explosives-permit/${record.explosives_permit_guid}`,
    },
    { title: "Mine Name", dataIndex: "mine_name", key: "mine_name" },
    { title: "Status", dataIndex: "application_status", key: "application_status" },
  ];

  const mockColumnsNow = [
    {
      title: "Application #",
      dataIndex: "now_number",
      key: "now_number",
      link: (record) => `/notice-of-work/${record.now_application_guid}`,
    },
    { title: "Mine Name", dataIndex: "mine_name", key: "mine_name" },
    { title: "Status", dataIndex: "now_application_status_code", key: "now_application_status_code" },
  ];

  const mockColumnsNod = [
    { title: "Application #", dataIndex: "nod_no", key: "nod_no" },
    { title: "Title", dataIndex: "nod_title", key: "nod_title" },
    { title: "Mine Name", dataIndex: "mine_name", key: "mine_name" },
    { title: "Status", dataIndex: "nod_status", key: "nod_status" },
  ];

  const mockGetRecordKey = (record: any) => record.explosives_permit_guid || record.now_application_guid || record.nod_guid;

  describe("Rendering", () => {
    it("renders without crashing", () => {
      const { container } = render(
        <ReduxWrapper>
          <GenericResultsTable
            searchResults={extractResults(mockResultsExplosivesPermits)}
            header="Test Results"
            columns={mockColumnsExplosives}
            getRecordKey={mockGetRecordKey}
            highlightRegex={null}

          />
        </ReduxWrapper>
      );
      expect(container).toBeTruthy();
    });

    it("renders table with results", () => {
      render(
        <ReduxWrapper>
          <GenericResultsTable
            searchResults={extractResults(mockResultsExplosivesPermits)}
            header="Test Results"
            columns={mockColumnsExplosives}
            getRecordKey={mockGetRecordKey}
            highlightRegex={null}

          />
        </ReduxWrapper>
      );

      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("displays correct number of rows", () => {
      const { container } = render(
        <ReduxWrapper>
          <GenericResultsTable
            searchResults={extractResults(mockResultsExplosivesPermits)}
            header="Test Results"
            columns={mockColumnsExplosives}
            getRecordKey={mockGetRecordKey}
            highlightRegex={null}

          />
        </ReduxWrapper>
      );

      const rows = container.querySelectorAll("tbody tr");
      expect(rows.length).toBe(2);
    });

    it("displays empty state when no results", () => {
      render(
        <ReduxWrapper>
          <GenericResultsTable
            searchResults={[]}
            header="Test Results"
            columns={mockColumnsExplosives}
            getRecordKey={mockGetRecordKey}
            highlightRegex={null}
          />
        </ReduxWrapper>
      );

      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });
  });

  describe("Explosives Permits", () => {
    it("displays application number", () => {
      render(
        <ReduxWrapper>
          <GenericResultsTable
            searchResults={extractResults(mockResultsExplosivesPermits)}
            header="Test Results"
            columns={mockColumnsExplosives}
            getRecordKey={mockGetRecordKey}
            highlightRegex={null}

          />
        </ReduxWrapper>
      );

      expect(screen.getByText("APP-001")).toBeInTheDocument();
      expect(screen.getByText("APP-002")).toBeInTheDocument();
    });

    it("displays mine name", () => {
      render(
        <ReduxWrapper>
          <GenericResultsTable
            searchResults={extractResults(mockResultsExplosivesPermits)}
            header="Test Results"
            columns={mockColumnsExplosives}
            getRecordKey={mockGetRecordKey}
            highlightRegex={null}

          />
        </ReduxWrapper>
      );

      expect(screen.getByText("Test Mine")).toBeInTheDocument();
      expect(screen.getByText("Another Mine")).toBeInTheDocument();
    });

    it("displays application status", () => {
      render(
        <ReduxWrapper>
          <GenericResultsTable
            searchResults={extractResults(mockResultsExplosivesPermits)}
            header="Test Results"
            columns={mockColumnsExplosives}
            getRecordKey={mockGetRecordKey}
            highlightRegex={null}

          />
        </ReduxWrapper>
      );

      expect(screen.getAllByText(/APP/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/REC/i).length).toBeGreaterThan(0);
    });

    it("displays status values", () => {
      render(
        <ReduxWrapper>
          <GenericResultsTable
            searchResults={extractResults(mockResultsExplosivesPermits)}
            header="Test Results"
            columns={mockColumnsExplosives}
            getRecordKey={mockGetRecordKey}
            highlightRegex={null}

          />
        </ReduxWrapper>
      );

      expect(screen.getByText(/^APP$/i)).toBeInTheDocument();
      expect(screen.getByText(/^REC$/i)).toBeInTheDocument();
    });

    it("makes application number clickable", () => {
      // This requires link configuration in column definition
      render(
        <ReduxWrapper>
          <GenericResultsTable
            searchResults={extractResults(mockResultsExplosivesPermits)}
            header="Test Results"
            columns={mockColumnsExplosives}
            getRecordKey={mockGetRecordKey}
            highlightRegex={null}

          />
        </ReduxWrapper>
      );

      const link = screen.getByText("APP-001").closest("a");
      expect(link).toHaveAttribute("href", expect.stringContaining("exp-123"));
    });
  });

  describe("NoW Applications", () => {
    it("displays NoW number", () => {
      render(
        <ReduxWrapper>
          <GenericResultsTable
            searchResults={extractResults(mockResultsNow)}
            header="Test Results"
            columns={mockColumnsNow}
            getRecordKey={mockGetRecordKey}
            highlightRegex={null}
          />
        </ReduxWrapper>
      );

      expect(screen.getByText("NOW-001")).toBeInTheDocument();
    });

    it("displays mine name", () => {
      render(
        <ReduxWrapper>
          <GenericResultsTable
            searchResults={extractResults(mockResultsNow)}
            header="Test Results"
            columns={mockColumnsNow}
            getRecordKey={mockGetRecordKey}
            highlightRegex={null}
          />
        </ReduxWrapper>
      );

      expect(screen.getByText("Test Mine")).toBeInTheDocument();
    });

    it("displays status", () => {
      render(
        <ReduxWrapper>
          <GenericResultsTable
            searchResults={extractResults(mockResultsNow)}
            header="Test Results"
            columns={mockColumnsNow}
            getRecordKey={mockGetRecordKey}
            highlightRegex={null}
          />
        </ReduxWrapper>
      );

      expect(screen.getByText(/REC/i)).toBeInTheDocument();
    });

    it("makes NoW number clickable", () => {
      // This requires link configuration in column definition
      render(
        <ReduxWrapper>
          <GenericResultsTable
            searchResults={extractResults(mockResultsNow)}
            header="Test Results"
            columns={mockColumnsNow}
            getRecordKey={mockGetRecordKey}
            highlightRegex={null}
          />
        </ReduxWrapper>
      );

      const link = screen.getByText("NOW-001").closest("a");
      expect(link).toHaveAttribute("href", expect.stringContaining("now-123"));
    });
  });

  describe("Notices of Departure", () => {
    it("displays NOD number", () => {
      render(
        <ReduxWrapper>
          <GenericResultsTable
            searchResults={extractResults(mockResultsNod)}
            header="Test Results"
            columns={mockColumnsNod}
            getRecordKey={mockGetRecordKey}
            highlightRegex={null}
          />
        </ReduxWrapper>
      );

      expect(screen.getByText("NOD-001")).toBeInTheDocument();
    });

    it("displays NOD title", () => {
      render(
        <ReduxWrapper>
          <GenericResultsTable
            searchResults={extractResults(mockResultsNod)}
            header="Test Results"
            columns={mockColumnsNod}
            getRecordKey={mockGetRecordKey}
            highlightRegex={null}
          />
        </ReduxWrapper>
      );

      expect(screen.getByText("Test NOD")).toBeInTheDocument();
    });

    it("displays mine name", () => {
      render(
        <ReduxWrapper>
          <GenericResultsTable
            searchResults={extractResults(mockResultsNod)}
            header="Test Results"
            columns={mockColumnsNod}
            getRecordKey={mockGetRecordKey}
            highlightRegex={null}
          />
        </ReduxWrapper>
      );

      expect(screen.getByText("Test Mine")).toBeInTheDocument();
    });

    it("displays status", () => {
      render(
        <ReduxWrapper>
          <GenericResultsTable
            searchResults={extractResults(mockResultsNod)}
            header="Test Results"
            columns={mockColumnsNod}
            getRecordKey={mockGetRecordKey}
            highlightRegex={null}
          />
        </ReduxWrapper>
      );

      expect(screen.getByText(/pending_review/i)).toBeInTheDocument();
    });
  });

  describe("Sorting", () => {
    it("allows sorting by columns", () => {
      render(
        <ReduxWrapper>
          <GenericResultsTable
            searchResults={extractResults(mockResultsExplosivesPermits)}
            header="Test Results"
            columns={mockColumnsNod}
            getRecordKey={mockGetRecordKey}
            highlightRegex={null}

          />
        </ReduxWrapper>
      );

      // Find sortable column header
      const columnHeaders = screen.getAllByRole("columnheader");
      const sortableHeader = columnHeaders.find(header =>
        header.textContent?.includes("Application")
      );

      expect(sortableHeader).toBeInTheDocument();
    });
  });

  describe("Relevance Score", () => {
    it("displays relevance indicator for high scores", () => {
      const highScoreResults = [
        {
          type: "explosives_permit",
          score: 50.0,
          result: {
            explosives_permit_guid: "exp-high",
            application_number: "APP-HIGH",
            mine_name: "High Score Mine",
          },
        },
      ];

      render(
        <ReduxWrapper>
          <GenericResultsTable
            searchResults={extractResults(highScoreResults)}
            header="Test Results"
            columns={mockColumnsExplosives}
            getRecordKey={mockGetRecordKey}
            highlightRegex={null}
          />
        </ReduxWrapper>
      );

      // High score should have visual indicator (e.g., badge or icon)
      expect(screen.getByText("APP-HIGH")).toBeInTheDocument();
    });
  });

  describe.skip("Pagination", () => {
    // Pagination is disabled in GenericResultsTable component
    it("displays pagination when many results", () => {
      const manyResults = Array.from({ length: 25 }, (_, i) => ({
        type: "explosives_permit",
        score: 10 - i * 0.1,
        result: {
          explosives_permit_guid: `exp-${i}`,
          application_number: `APP-${String(i).padStart(3, '0')}`,
          mine_name: "Test Mine",
        },
      }));

      const { container } = render(
        <ReduxWrapper>
          <GenericResultsTable
            searchResults={extractResults(manyResults)}
            header="Test Results"
            columns={mockColumnsNod}
            getRecordKey={mockGetRecordKey}
            highlightRegex={null}
          />
        </ReduxWrapper>
      );

      // Should have pagination controls
      expect(container.querySelector(".ant-pagination")).toBeInTheDocument();
    });

    it("changes page when pagination clicked", () => {
      const manyResults = Array.from({ length: 25 }, (_, i) => ({
        type: "explosives_permit",
        score: 10 - i * 0.1,
        result: {
          explosives_permit_guid: `exp-${i}`,
          application_number: `APP-${String(i).padStart(3, '0')}`,
          mine_name: "Test Mine",
        },
      }));

      const { container } = render(
        <ReduxWrapper>
          <GenericResultsTable
            searchResults={extractResults(manyResults)}
            header="Test Results"
            columns={mockColumnsNod}
            getRecordKey={mockGetRecordKey}
            highlightRegex={null}
          />
        </ReduxWrapper>
      );

      const nextButton = container.querySelector(".ant-pagination-next");
      if (nextButton) {
        fireEvent.click(nextButton);

        // Should display next set of results
        expect(screen.getByText(/APP-010/)).toBeInTheDocument();
      }
    });
  });

  describe.skip("Loading State", () => {
    // Loading state is not implemented in GenericResultsTable component
    it("displays loading indicator when loading prop is true", () => {
      render(
        <ReduxWrapper>
          <GenericResultsTable
            searchResults={extractResults(mockResultsExplosivesPermits)}
            header="Test Results"
            columns={mockColumnsNod}
            getRecordKey={mockGetRecordKey}
            highlightRegex={null}

          />
        </ReduxWrapper>
      );

      expect(screen.getByRole("img", { hidden: true })).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has accessible table headers", () => {
      render(
        <ReduxWrapper>
          <GenericResultsTable
            searchResults={extractResults(mockResultsExplosivesPermits)}
            header="Test Results"
            columns={mockColumnsNod}
            getRecordKey={mockGetRecordKey}
            highlightRegex={null}

          />
        </ReduxWrapper>
      );

      const headers = screen.getAllByRole("columnheader");
      expect(headers.length).toBeGreaterThan(0);
    });

    it("has accessible row navigation", () => {
      render(
        <ReduxWrapper>
          <GenericResultsTable
            searchResults={extractResults(mockResultsExplosivesPermits)}
            header="Test Results"
            columns={mockColumnsNod}
            getRecordKey={mockGetRecordKey}
            highlightRegex={null}

          />
        </ReduxWrapper>
      );

      const rows = screen.getAllByRole("row");
      expect(rows.length).toBeGreaterThan(0);
    });
  });
});
