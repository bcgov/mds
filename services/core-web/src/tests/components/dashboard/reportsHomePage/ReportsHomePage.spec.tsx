import React from "react";
import { render } from "@testing-library/react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { AUTHENTICATION, MINES, REPORTS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { BrowserRouter } from "react-router-dom";
import ReportsHomePage from "@/components/dashboard/reportsHomePage/ReportsHomePage";
import { SystemFlagEnum } from "@mds/common";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const initialState: any = {
  [REPORTS]: { reports: MOCK.MINE_REPORTS, reportsPageData: MOCK.REPORTS_PAGE_DATA },
  [MINES]: MOCK.MINES,
  [STATIC_CONTENT]: MOCK.BULK_STATIC_CONTENT_RESPONSE,
  [AUTHENTICATION]: {
    systemFlag: SystemFlagEnum.core,
    userAccessData: [],
  },
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      id: "1234",
      reportType: "code-required-reports",
    }),
    useLocation: jest.fn().mockReturnValue({
      search: "page=1&per_page=1",
    }),
    useHistory: jest.fn().mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      location: { hash: "" },
    }),
  };
}
jest.mock("react-router-dom", () => mockFunction());

describe("ReportsHomePage", () => {
  it("renders properly", async () => {
    const { container } = render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <ReportsHomePage />
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(container).toMatchSnapshot();
  });
});
