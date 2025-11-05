import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Reports } from "@/components/dashboard/mine/reports/Reports";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { SidebarProvider } from "@mds/common/components/common/SidebarWrapper";
import { AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import {
  complianceReportReducerType,
  reportParamsGetAll,
} from "@mds/common/redux/slices/complianceReportsSlice";
import { Feature } from "@mds/common/utils/featureFlag";
import { reportReducerType } from "@mds/common/redux/slices/reportSlice";

// Force the legacy reports UI by turning off the v2 feature flag for this test suite
jest.mock("@mds/common/providers/featureFlags/useFeatureFlag", () => ({
  useFeatureFlag: () => ({
    isFeatureEnabled: (f: Feature) => {
      if (f === Feature.REPORT_MANAGEMENT_V2) {
        return false;
      }
      return true;
    },
  }),
}));

const initialState = {
  [reportReducerType]: { mineReports: MOCK.MINE_REPORTS, reportsPageData: MOCK.PAGE_DATA },
  [complianceReportReducerType]: {
    reportPageData: {
      records: MOCK.MINE_REPORT_DEFINITION_OPTIONS,
      current_page: 1,
      items_per_page: MOCK.MINE_REPORT_DEFINITION_OPTIONS.length,
      total: MOCK.MINE_REPORT_DEFINITION_OPTIONS.length,
      total_pages: 1,
    },
    params: reportParamsGetAll,
  },
  // Ensure AuthorizationWrapper renders actions by setting proponent access
  [AUTHENTICATION]: {
    isAuthenticated: true,
    userAccessData: [],
    userInfo: {},
    redirect: false,
    isProponent: true,
    systemFlag: undefined,
  },
};

const mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];

describe("Reports", () => {
  it("renders properly", () => {
    const { container } = render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <SidebarProvider value={{ mine } as any}>
            <Reports />
          </SidebarProvider>
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(container).toMatchSnapshot();
  });
  it("renders primary UI elements", async () => {
    render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <SidebarProvider value={{ mine } as any}>
            <Reports />
          </SidebarProvider>
        </ReduxWrapper>
      </BrowserRouter>
    );
    // Header and intro text (v1)
    expect(screen.getByRole("heading", { name: /^reports$/i })).toBeInTheDocument();
    expect(screen.getByText(/view all/i)).toBeInTheDocument();
    expect(screen.getAllByText(/code required reports/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/permit required reports/i)[0]).toBeInTheDocument();

    // CTA button remains
    expect(screen.getByRole("button", { name: /submit report/i })).toBeInTheDocument();

    // Section headings (v1)
    expect(
      screen.getAllByRole("heading", { level: 4, name: /code required reports/i })[0]
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("heading", { level: 4, name: /permit required reports/i })[0]
    ).toBeInTheDocument();

    // Table headers present (two tables render the same headers)
    expect(screen.getAllByText("Report Name/Permit Condition").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/compliance year/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^due$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/submitted/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^status$/i).length).toBeGreaterThan(0);
  });
});
