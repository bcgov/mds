import React from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SidebarContext } from "@mds/common/components/common/SidebarWrapper";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import ReportManagement from "@/components/dashboard/mine/reports/ReportManagement";
import * as Strings from "@mds/common/constants/strings";
import { lastMineReportsRequest, lastPermitsRequest } from "@/tests/handlers";
import {
  PERMITS as MOCK_PERMITS,
  MINE_REPORTS as MOCK_MINE_REPORTS,
  MINE_REPORT_RESPONSE as MOCK_MINE_REPORT_RESPONSE,
  MINE_REPORT_DEFINITION_OPTIONS as MOCK_REPORT_DEFS,
  MOCK_MINE_REPORT_STATS,
} from "@mds/common/tests/mocks/dataMocks";

describe("ReportManagement", () => {
  // Use a real GUID from mocks where possible to keep data coherent
  const mineGuid = "8e9ca839-a28e-427e-997e-9ef23d9d97cd";

  const initialState = {
    // Minimal report reducer shape to render table and pagination props using shared mocks
    REPORTS: {
      reports: [],
      reportsPageData: MOCK_MINE_REPORT_RESPONSE,
      mineReports: MOCK_MINE_REPORTS,
      mineReportGuid: "",
      reportComments: [],
    },
    MINE_REPORT_STATS: {
      byMineGuid: {
        [mineGuid]: MOCK_MINE_REPORT_STATS,
      },
    },
    // Permits reducer seeded from common mocks
    PERMITS: {
      permits: MOCK_PERMITS,
      draftPermits: [],
      permitConditions: [],
      editingConditionFlag: false,
      editingPreambleFlag: false,
      standardPermitConditions: [],
      latestPermitAmendments: {},
      permitAmendments: {},
    },
    // Compliance report definitions so Code Section can render correctly
    complianceReports: {
      reportPageData: {
        records: MOCK_REPORT_DEFS,
        current_page: 1,
        items_per_page: MOCK_REPORT_DEFS.length,
        total: MOCK_REPORT_DEFS.length,
        total_pages: 1,
      },
      params: {},
      dueDateTypes: [],
      expiredMineReportDefinition: undefined,
    },
  } as any;

  const renderWithProviders = () => {
    const mine: any = { mine_guid: mineGuid };
    return render(
      <ReduxWrapper initialState={initialState}>
        <MemoryRouter>
          <SidebarContext.Provider value={{ mine }}>
            <ReportManagement />
          </SidebarContext.Provider>
        </MemoryRouter>
      </ReduxWrapper>
    );
  };

  it("renders heading, description, summary cards, and Submit Report link", async () => {
    const { container } = renderWithProviders();

    expect(screen.getByRole("heading", { name: /Report Management/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Review and manage reports required for your mine's permit/i)
    ).toBeInTheDocument();

    const submitLink = screen.getByRole("link", { name: /Submit Report/i });
    expect(submitLink).toBeInTheDocument();
    expect(submitLink).toHaveAttribute("href", `/mines/${mineGuid}/reports/new`);

    const activePermitsCard = screen.getByText("Active Permits").closest(".table-summary-card");
    expect(activePermitsCard).toBeTruthy();
    // From mocks, there are 3 active permits with status code 'O'
    expect(within(activePermitsCard as HTMLElement).getByText("3")).toBeInTheDocument();

    const overdueCard = screen.getByText("Reports Overdue").closest(".table-summary-card");
    expect(within(overdueCard as HTMLElement).getByText("4")).toBeInTheDocument();

    const dueNextCard = screen
      .getByText("Reports Due in the Next 90 Days")
      .closest(".table-summary-card");
    expect(within(dueNextCard as HTMLElement).getByText("5")).toBeInTheDocument();

    // "Reminder" alert content
    expect(
      screen.getByText(/Your permit is the official source of reporting requirements/i)
    ).toBeInTheDocument();

    // Tab section title
    expect(screen.getByRole("heading", { name: /All Reports/i })).toBeInTheDocument();

    // Table content should include at least one of the mocked report names
    const reportNameMatches = screen.getAllByText(
      /Annual DSI|TSF, WSF or Dam As-built Report|Underground Oil and Grease Storage Area Report/
    );
    expect(reportNameMatches.length).toBeGreaterThan(0);

    // Verify network calls were made with expected params via MSW handlers capture
    await waitFor(() => {
      expect(lastMineReportsRequest?.mineGuid).toEqual(mineGuid);
      // mine_reports_type should contain both CRR and PRR
      const mrt = lastMineReportsRequest?.query?.mine_reports_type;
      const asArray = Array.isArray(mrt) ? mrt : mrt ? [mrt] : [];
      expect(asArray).toEqual(
        expect.arrayContaining([
          Strings.MINE_REPORTS_TYPE.codeRequiredReports,
          Strings.MINE_REPORTS_TYPE.permitRequiredReports,
        ])
      );
      expect(lastMineReportsRequest?.query?.page).toBe("1");
      expect(lastMineReportsRequest?.query?.per_page).toBe("20");
    });
  });

  it("renders and matches snapshot", async () => {
    const { container } = renderWithProviders();

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /All Reports/i })).toBeInTheDocument()
    );

    expect(container).toMatchSnapshot();
  });
});
