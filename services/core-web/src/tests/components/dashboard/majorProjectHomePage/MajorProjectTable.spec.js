import React from "react";
import MajorProjectTable from "@/components/dashboard/majorProjectHomePage/MajorProjectTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";

const props = {};

const setupProps = () => {
  props.handleSearch = jest.fn();
  props.projects = MOCK.MAJOR_PROJECTS_DASHBOARD.records;
  props.sortField = "project_id";
  props.sortDir = "asc";
  props.searchParams = { search: "substring" };
};

beforeEach(() => {
  setupProps();
});

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
