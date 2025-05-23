import React from "react";
import { render } from "@testing-library/react";
import NoticeOfWorkTable from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

const props = {
  handleSearch: jest.fn(),
  noticeOfWorkApplications: MOCK.NOW.applications,
  sortField: "trackingnumber",
  sortDir: "asc",
  searchParams: { mine_search: "substring", mine_region: "SW,NE" },
  mineRegionHash: MOCK.REGION_HASH,
  mineRegionOptions: [],
  applicationTypeOptions: [],
  applicationStatusOptions: [],
};

describe("NoticeOfWorkTable", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <NoticeOfWorkTable {...props} />
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
