import React from "react";
import { render } from "@testing-library/react";
import NoticeOfWorkTable from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";
import { NoWSearchParams } from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkHomePage";

const props = {
  handleSearch: jest.fn(),
  noticeOfWorkApplications: MOCK.NOW.applications,
  sortField: "trackingnumber",
  sortDir: "asc",
  searchParams: {} as NoWSearchParams,
  mineRegionHash: MOCK.REGION_HASH,
  mineRegionOptions: [],
  applicationTypeOptions: [],
  applicationStatusOptions: [],
  isLoaded: true,
  defaultParams: {} as NoWSearchParams,
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
