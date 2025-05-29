import React from "react";
import { render } from "@testing-library/react";
import { MineApplications } from "@/components/mine/NoticeOfWork/MineApplications";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

const props = {
  mineGuid: MOCK.NOW.applications[0].mine_guid,
  mines: { [MOCK.NOW.applications[0].mine_guid]: { major_mine_ind: true } },
  history: { replace: jest.fn() },
  location: { search: "" },
  noticeOfWorkApplications: MOCK.NOW.applications,
  mineRegionHash: MOCK.REGION_HASH,
  explosivesPermits: [],
};
const dispatchProps = {
  fetchRegionOptions: jest.fn(() => Promise.resolve()),
  fetchExplosivesPermits: jest.fn(() => Promise.resolve()),
  fetchMineNoticeOfWorkApplications: jest.fn(() => Promise.resolve()),
};

describe("MineApplications", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <MineApplications {...props} {...dispatchProps} />
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
