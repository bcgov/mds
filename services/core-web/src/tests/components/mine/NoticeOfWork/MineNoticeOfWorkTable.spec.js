import React from "react";
import { shallow } from "enzyme";
import { MineNoticeOfWorkTable } from "@/components/mine/NoticeOfWork/MineNoticeOfWorkTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.handleSearch = jest.fn();
  props.noticeOfWorkApplications = MOCK.NOW.applications;
  props.sortField = "now_number";
  props.sortDir = "asc";
  props.searchParams = { noticeofworktype: "other" };
};

beforeEach(() => {
  setupProps();
});

describe("MineNoticeOfWorkTable", () => {
  it("renders properly", () => {
    const component = shallow(<MineNoticeOfWorkTable {...props} />);
    expect(component).toMatchSnapshot();
  });
});
