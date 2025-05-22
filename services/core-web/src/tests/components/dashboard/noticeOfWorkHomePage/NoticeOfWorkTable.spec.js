import React from "react";
import { render } from "@testing-library/react";
import NoticeOfWorkTable from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

const props = {};

const setupProps = () => {
  props.handleSearch = jest.fn();
  props.noticeOfWorkApplications = MOCK.NOW.applications;
  props.sortField = "trackingnumber";
  props.sortDir = "asc";
  props.searchParams = { mine_search: "substring", mine_region: "SW,NE" };
  props.mineRegionHash = MOCK.REGION_HASH;
  props.mineRegionOptions = [];
  props.applicationTypeOptions = [];
  props.applicationStatusOptions = [];
};

beforeEach(() => {
  setupProps();
});

describe("NoticeOfWorkTable", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><NoticeOfWorkTable {...props} /></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
