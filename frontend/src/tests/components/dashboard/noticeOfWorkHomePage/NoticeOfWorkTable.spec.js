import React from "react";
import { shallow } from "enzyme";
import NoticeOfWorkTable from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.handleSearch = jest.fn();
  props.noticeOfWorkApplications = MOCK.NOW.applications;
  props.sortField = "trackingnumber";
  props.sortDir = "asc";
  props.searchParams = { mine_search: "substring", mine_region: "SW,NE" };
  props.mineRegionHash = MOCK.REGION_HASH;
};

beforeEach(() => {
  setupProps();
});

describe("NoticeOfWorkTable", () => {
  it("renders properly", () => {
    const component = shallow(<NoticeOfWorkTable {...props} />);
    expect(component).toMatchSnapshot();
  });
});
