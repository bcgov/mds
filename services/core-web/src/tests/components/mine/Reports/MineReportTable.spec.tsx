import React from "react";
import { MineReportTable } from "@/components/mine/Reports/MineReportTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { render, within } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import { MINE_REPORTS_ENUM, MINE_REPORT_SUBMISSION_CODES } from "@mds/common/constants/enums";

const initialState = {
  [AUTHENTICATION]: {
    userAccessData: MOCK.USER_ACCESS_DATA,
  },
};

describe("MineReportTable", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <MineReportTable
            mineReports={MOCK.MINE_REPORTS}
            mineReportType={MINE_REPORTS_ENUM.CRR}
            isLoaded
            handleRemoveReport={jest.fn()}
          />
        </BrowserRouter>
      </ReduxWrapper>
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("shows Overdue badge when report.is_overdue is true", () => {
    const overdueReport = {
      ...MOCK.MINE_REPORTS[0],
      is_overdue: true,
      mine_report_status_code: MINE_REPORT_SUBMISSION_CODES.NON, // status shouldn't render when overdue
    };

    const normalReport = {
      ...MOCK.MINE_REPORTS[1],
      is_overdue: false,
    };

    render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <MineReportTable
            mineReports={[overdueReport, normalReport]}
            mineReportType={MINE_REPORTS_ENUM.CRR}
            isLoaded
            handleRemoveReport={jest.fn()}
          />
        </BrowserRouter>
      </ReduxWrapper>
    );

    expect(within(document.querySelector('table')).getAllByText(/Overdue/i).length).toBe(1);
  });
});
