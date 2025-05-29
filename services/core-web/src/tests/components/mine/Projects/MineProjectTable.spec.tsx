import React from "react";
import { render } from "@testing-library/react";
import { MineProjectTable } from "@/components/mine/Projects/MineProjectTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

const props = {
  projects: MOCK.PROJECTS.records,
  projectSummaryStatusCodesHash: MOCK.PROJECT_SUMMARY_STATUS_CODES_HASH,
  isLoaded: true,
};

describe("MineProjectTable", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <MineProjectTable {...props} />
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
