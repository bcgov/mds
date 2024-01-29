import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { AUTHENTICATION, MINES, REPORTS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { SystemFlagEnum } from "@mds/common";
import ReportPage from "@/components/mine/Reports/ReportPage";
import { BrowserRouter } from "react-router-dom";

const mineReport = MOCK.MINE_REPORTS[0];
const initialState = {
  [REPORTS]: {
    reports: MOCK.MINE_REPORTS,
    mineReportGuid: mineReport.mine_report_guid,
    mineReports: [mineReport],
  },
  [MINES]: MOCK.MINES,
  [STATIC_CONTENT]: {
    mineReportDefinitionOptions: MOCK.BULK_STATIC_CONTENT_RESPONSE.mineReportDefinitionOptions,
  },
  [AUTHENTICATION]: {
    systemFlag: SystemFlagEnum.core,
  },
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      mineGuid: MOCK.MINE_REPORTS[0].mine_guid,
      reportGuid: MOCK.MINE_REPORTS[0].mine_report_guid,
    }),
    useLocation: jest.fn().mockReturnValue({
      tab: "",
      hash: "",
    }),
    useHistory: jest.fn().mockReturnValue({
      push: jest.fn(),
      location: { hash: "" },
    }),
  };
}
jest.mock("react-router-dom", () => mockFunction());

describe("ReportDetailsForm", () => {
  it("renders view mode properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <ReportPage />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
