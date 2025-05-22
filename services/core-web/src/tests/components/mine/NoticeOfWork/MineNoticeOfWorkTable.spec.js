import React from "react";
import { render } from "@testing-library/react";
import { MineNoticeOfWorkTable } from "@/components/mine/NoticeOfWork/MineNoticeOfWorkTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";

const props = {};

const setupProps = () => {
  props.handleSearch = jest.fn();
  props.noticeOfWorkApplications = MOCK.NOW.applications;
  props.sortField = "now_number";
  props.sortDir = "asc";
  props.searchParams = { noticeofworktype: "other" };
  props.location = { pathname: "pathname", search: "search" }
};

beforeEach(() => {
  setupProps();
});

describe("MineNoticeOfWorkTable", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><ReduxWrapper><MineNoticeOfWorkTable {...props} /></ReduxWrapper></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
