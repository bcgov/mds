import React from "react";
import { render } from "@testing-library/react";
import { Reports } from "@/components/dashboard/mine/reports/Reports";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { SidebarProvider } from "@mds/common/components/common/SidebarWrapper";
import { REPORTS } from "@mds/common/constants/reducerTypes";
import {
  complianceReportReducerType,
  reportParamsGetAll,
} from "@mds/common/redux/slices/complianceReportsSlice";

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
};

const mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];

describe("Reports", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <SidebarProvider value={{ mine } as any}>
          <Reports />
        </SidebarProvider>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
