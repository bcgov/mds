import React from "react";
import { render } from "@testing-library/react";
import { Reports } from "@/components/dashboard/mine/reports/Reports";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { SidebarProvider } from "@mds/common/components/common/SidebarWrapper";
import { REPORTS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";

const initialState = {
  [REPORTS]: {
    mineReports: MOCK.MINE_REPORTS,
  },
  [STATIC_CONTENT]: {
    mineReportDefinitionOptions: MOCK.BULK_STATIC_CONTENT_RESPONSE.mineReportDefinitionOptions,
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
