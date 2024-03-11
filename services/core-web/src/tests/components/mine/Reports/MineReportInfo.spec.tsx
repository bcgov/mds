import React from "react";
import { render } from "@testing-library/react";
import { MineReportInfo } from "@/components/mine/Reports/MineReportInfo";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { AUTHENTICATION, STATIC_CONTENT, SystemFlagEnum } from "@mds/common";
import { MINES, REPORTS } from "@mds/common/constants/reducerTypes";
import { BrowserRouter } from "react-router-dom";

const initialState: any = {
  [REPORTS]: { mineReports: MOCK.MINE_REPORTS },
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
      search: "",
    }),
    useHistory: jest.fn().mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      location: { hash: "" },
    }),
  };
}
jest.mock("react-router-dom", () => mockFunction());

describe("MineReportInfo", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <MineReportInfo />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
