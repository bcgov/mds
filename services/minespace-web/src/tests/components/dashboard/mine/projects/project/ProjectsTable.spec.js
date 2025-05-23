import React from "react";
import { render } from "@testing-library/react";
import { ProjectsTable } from "@/components/dashboard/mine/projects/ProjectsTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

const props = {
  projects: MOCK.PROJECTS.records,
};
const dispatchProps = {};

describe("ProjectsTable", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <ProjectsTable {...props} {...dispatchProps} />
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
