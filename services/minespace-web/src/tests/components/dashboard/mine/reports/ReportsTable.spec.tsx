import React from "react";
import { render, screen, within, fireEvent, waitFor } from "@testing-library/react";
import {
  ReportsTable,
  reportStatusSeverity,
} from "@/components/dashboard/mine/reports/ReportsTable";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { complianceReportReducerType } from "@mds/common/redux/slices/complianceReportsSlice";
import { IMineReport, IMineReportDefinition } from "@mds/common/interfaces";
import { MINE_REPORT_SUBMISSION_CODES } from "@mds/common/constants/enums";

// Minimal report definition with a compliance article so Code Section can render
const DEF_GUID = "def-guid-1";
const REPORT_DEF: IMineReportDefinition = {
  mine_report_definition_guid: DEF_GUID,
  report_name: "Test Report",
  description: "",
  due_date_period_months: 12,
  mine_report_due_date_type: "FIS" as any,
  default_due_date: "2020-03-31",
  categories: [],
  compliance_articles: [
    {
      compliance_article_id: 1,
      article_act_code: "HSRCM",
      section: "10",
      sub_section: "5",
      paragraph: "1",
      sub_paragraph: "1",
      description: "General",
      long_description: "General",
      effective_date: "1970-01-01",
      expiry_date: "9999-12-31",
      help_reference_link: "",
      cim_or_cpo: "Both",
      reports: [],
    },
  ],
  active_ind: true,
  is_common: false,
  is_prr_only: false,
};

const initialComplianceState = {
  [complianceReportReducerType]: {
    reportPageData: {
      records: [REPORT_DEF],
      current_page: 1,
      items_per_page: 1,
      total: 1,
      total_pages: 1,
    },
    params: {},
  },
};

const baseReport = (overrides: Partial<IMineReport> = {}): IMineReport =>
  ({
    mine_report_guid: (overrides as any).mine_report_guid || Math.random().toString(36).slice(2),
    mine_report_definition_guid: DEF_GUID,
    report_name: "Test Report",
    submission_year: 2024 as any,
    due_date: "2024-12-31" as any,
    latest_submission: { received_date: "2024-01-15" } as any,
    created_by_idir: "idir_user",
    mine_report_status_code: MINE_REPORT_SUBMISSION_CODES.NRQ,
    permit_guid: null,
    ...overrides,
  }) as IMineReport;

describe("ReportsTable", () => {
  it("renders Code Section column when no reports have a permit", () => {
    const openReport = jest.fn();
    const mineReports: IMineReport[] = [baseReport()];

    render(
      <ReduxWrapper initialState={initialComplianceState}>
        <ReportsTable
          mineReports={mineReports}
          openReport={openReport}
          isLoaded
          backendPaginated={false}
        />
      </ReduxWrapper>
    );

    expect(screen.getByText("Code Section")).toBeInTheDocument();
    // A formatted code such as 10.5.1.1 should appear (no description in Minespace helpers)
    expect(screen.getByText(/^10\.5\.1\.1$/)).toBeInTheDocument();
  });

  it("renders Permit # column when any report has a permit_guid", () => {
    const openReport = jest.fn();
    const mineReports: IMineReport[] = [
      baseReport({ mine_report_guid: "r1", permit_guid: "permit-1" } as any),
      baseReport({ mine_report_guid: "r2" } as any),
    ];

    render(
      <ReduxWrapper initialState={initialComplianceState}>
        <ReportsTable
          mineReports={mineReports}
          openReport={openReport}
          isLoaded
          backendPaginated={false}
        />
      </ReduxWrapper>
    );

    expect(screen.getByText("Permit #")).toBeInTheDocument();
    expect(screen.queryByText("Code Section")).not.toBeInTheDocument();
  });

  it("filters actions correctly and calls openReport with proper args", async () => {
    const openReport = jest.fn();
    const r1 = baseReport({
      mine_report_guid: "s1",
      mine_report_status_code: MINE_REPORT_SUBMISSION_CODES.NON,
    } as any);
    const r2 = baseReport({
      mine_report_guid: "s2",
      mine_report_status_code: MINE_REPORT_SUBMISSION_CODES.REC,
    } as any);
    const mineReports: IMineReport[] = [r1, r2];

    render(
      <ReduxWrapper initialState={initialComplianceState}>
        <ReportsTable
          mineReports={mineReports}
          openReport={openReport}
          isLoaded
          backendPaginated={false}
        />
      </ReduxWrapper>
    );

    // There should be an Actions button per row
    const actionButtons = screen.getAllByRole("button", { name: /Actions/i });
    expect(actionButtons.length).toBe(2);

    // Helper to scope queries to the most recently opened dropdown (AntD renders in a portal)
    const getLastDropdown = () => {
      const dropdowns = document.body.querySelectorAll(".ant-dropdown");
      return dropdowns.length ? (dropdowns[dropdowns.length - 1] as HTMLElement) : null;
    };

    // Row 1 (status NON): should show Submit but not View
    // AntD Dropdown opens on hover by default; use mouseEnter and explicitly wait until the menu exists
    fireEvent.mouseEnter(actionButtons[0]);
    await waitFor(() => expect(getLastDropdown()).not.toBeNull());
    const firstMenu = getLastDropdown()!;
    expect(within(firstMenu).queryByTestId("action-button-view")).not.toBeInTheDocument();
    expect(within(firstMenu).getByTestId("action-button-submit")).toBeInTheDocument();
    fireEvent.click(within(firstMenu).getByTestId("action-button-submit"));
    expect(openReport).toHaveBeenCalledWith(
      expect.objectContaining({ mine_report_guid: "s1" }),
      true
    );

    // Ensure the first dropdown is closed before validating the next row to avoid stale portal content
    fireEvent.mouseLeave(actionButtons[0]);
    // Some environments require a click outside to dismiss the menu; do both and wait until hidden
    fireEvent.click(document.body);
    await waitFor(() => {
      const maybeDropdown = getLastDropdown();
      expect(maybeDropdown).not.toBeNull();
      expect(maybeDropdown!.classList.contains("ant-dropdown-hidden")).toBe(true);
    });

    // Row 2 (status ACC): should show View but not Submit
    fireEvent.mouseEnter(actionButtons[1]);
    await waitFor(() =>
      expect(document.body.querySelectorAll(".ant-dropdown").length).toBeGreaterThan(1)
    );
    let secondMenu = getLastDropdown();
    expect(within(secondMenu).getByTestId("action-button-view")).toBeInTheDocument();
    expect(within(secondMenu).queryByTestId("action-button-submit")).not.toBeInTheDocument();
    fireEvent.click(within(secondMenu).getByTestId("action-button-view"));
    expect(openReport).toHaveBeenCalledWith(expect.objectContaining({ mine_report_guid: "s2" }));
  });

  it("renders Overdue badge when report.is_overdue is true", () => {
    const openReport = jest.fn();
    const overdue: IMineReport = baseReport({
      mine_report_guid: "overdue-1",
      is_overdue: true,
      mine_report_status_code: MINE_REPORT_SUBMISSION_CODES.NON,
      report_name: "Report 1",
    });
    const normal: IMineReport = baseReport({
      mine_report_guid: "normal-1",
      is_overdue: false,
      mine_report_status_code: MINE_REPORT_SUBMISSION_CODES.REC,
      report_name: "Regular Report",
    });

    render(
      <ReduxWrapper initialState={initialComplianceState}>
        <ReportsTable
          mineReports={[overdue, normal]}
          openReport={openReport}
          isLoaded
          backendPaginated={false}
        />
      </ReduxWrapper>
    );

    const overdueBadges = within(document.querySelector("table")).getAllByText(/Overdue/i);
    expect(overdueBadges.length).toBe(1);
  });
});

describe("reportStatusSeverity", () => {
  it("maps statuses to correct badge severities", () => {
    expect(reportStatusSeverity(MINE_REPORT_SUBMISSION_CODES.REQ)).toBe("warning");
    expect(reportStatusSeverity(MINE_REPORT_SUBMISSION_CODES.REC)).toBe("warning");
    expect(reportStatusSeverity(MINE_REPORT_SUBMISSION_CODES.NON)).toBe("warning");
    expect(reportStatusSeverity(MINE_REPORT_SUBMISSION_CODES.ACC)).toBe("success");
    expect(reportStatusSeverity(MINE_REPORT_SUBMISSION_CODES.NRQ)).toBe("success");
    expect(reportStatusSeverity(MINE_REPORT_SUBMISSION_CODES.INI)).toBe("success");
    expect(reportStatusSeverity(MINE_REPORT_SUBMISSION_CODES.WTD)).toBe("default");
  });
});
