import React from "react";
import { render } from "@testing-library/react";
import { MineNoticeOfWorkTable } from "@/components/mine/NoticeOfWork/MineNoticeOfWorkTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";

const props = {
  handleSearch: jest.fn(),
  noticeOfWorkApplications: MOCK.NOW.applications,
  sortField: "now_number",
  sortDir: "asc",
  searchParams: { noticeofworktype: "other" },
  location: { pathname: "pathname", search: "search" },
};

describe("MineNoticeOfWorkTable", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <ReduxWrapper>
          <MineNoticeOfWorkTable {...props} />
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
