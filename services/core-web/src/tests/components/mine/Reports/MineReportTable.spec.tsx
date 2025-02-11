import React from "react";
import { MineReportTable } from "@/components/mine/Reports/MineReportTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import { MINE_REPORTS_ENUM } from "@mds/common/constants/enums";

const props = {
  mineReports: MOCK.MINE_REPORTS,
  mineReportType: MINE_REPORTS_ENUM.CRR,
  isLoaded: false,
  handleRemoveReport: jest.fn(),
};

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
          <MineReportTable {...props} />
        </BrowserRouter>
      </ReduxWrapper>
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
