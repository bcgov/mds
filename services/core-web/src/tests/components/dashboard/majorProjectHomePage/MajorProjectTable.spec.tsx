import React from "react";
import MajorProjectTable from "@/components/dashboard/majorProjectHomePage/MajorProjectTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";

const props = {
  handleSearch: jest.fn(),
  projects: [MOCK.PROJECT],
  sortField: "project_id",
  sortDir: "asc",
  searchParams: { search: "substring" },
  mineCommodityOptionsHash: {},
  filters: {},
  isLoaded: true,
  expandedRowKeys: [],
  onExpand: jest.fn(),
};

describe("MajorProjectTable", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={{}}>
        <BrowserRouter>
          <MajorProjectTable {...props} />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
