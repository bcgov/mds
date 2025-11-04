import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Reports } from "@/components/dashboard/mine/reports/Reports";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { SidebarProvider } from "@mds/common/components/common/SidebarWrapper";
import { REPORTS, AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import {
  complianceReportReducerType,
  reportParamsGetAll,
} from "@mds/common/redux/slices/complianceReportsSlice";
import { Feature } from "@mds/common/utils/featureFlag";

// Force the v2 reports UI by turning on the feature flag for this test suite
jest.mock("@mds/common/providers/featureFlags/useFeatureFlag", () => ({
  useFeatureFlag: () => ({
    isFeatureEnabled: (f: Feature) => {
      if (f === Feature.REPORT_MANAGEMENT_V2) return true;
      return true;
    },
  }),
}));

const initialState = {
  [REPORTS]: { mineReports: MOCK.MINE_REPORTS, reportsPageData: MOCK.PAGE_DATA },
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

describe("Reports (v2)", () => {
  it("renders v2 layout with primary UI elements when feature flag is enabled", async () => {
    render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <SidebarProvider value={{ mine } as any}>
            <Reports />
          </SidebarProvider>
        </ReduxWrapper>
      </BrowserRouter>
    );

    // v2 page heading and key elements
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /Report Management/i })).toBeInTheDocument()
    );
    expect(screen.getByRole("link", { name: /Submit Report/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /All Reports/i })).toBeInTheDocument();
  });

  it("matches snapshot (v2)", async () => {
    const { container } = render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <SidebarProvider value={{ mine } as any}>
            <Reports />
          </SidebarProvider>
        </ReduxWrapper>
      </BrowserRouter>
    );

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /All Reports/i })).toBeInTheDocument()
    );

    expect(container).toMatchSnapshot();
  });
});
