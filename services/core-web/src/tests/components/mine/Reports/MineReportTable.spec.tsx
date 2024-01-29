import React from "react";
import { MineReportTable } from "@/components/mine/Reports/MineReportTable";
import * as MOCK from "@/tests/mocks/dataMocks";
import { AUTHENTICATION } from "@mds/common";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

// const dispatchProps = {};
const props = {
  mine: MOCK.MINES.mines[MOCK.MINES.mineIds[0]],
  mineReports: MOCK.MINE_REPORTS,
  mineReportCategoryOptionsHash: MOCK.MINE_REPORT_CATEGORY_OPTIONS_HASH,
  mineReportStatusOptionsHash: MOCK.MINE_REPORT_STATUS_OPTIONS_HASH,
};

// const setupProps = () => {
//   props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
//   props.mineReports = MOCK.MINE_REPORTS;
//   props.mineReportCategoryOptionsHash = MOCK.MINE_REPORT_CATEGORY_OPTIONS_HASH;
//   props.mineReportStatusOptionsHash = MOCK.MINE_REPORT_STATUS_OPTIONS_HASH;
// };

// beforeEach(() => {
//   setupProps();
// });

// describe("MineReportTable", () => {
//   it.skip("renders properly", () => {
//     const component = shallow(<MineReportTable {...dispatchProps} {...props} />);
//     expect(component).toMatchSnapshot();
//   });
// });
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
