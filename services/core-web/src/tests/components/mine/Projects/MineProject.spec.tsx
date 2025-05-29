import React from "react";
import { render } from "@testing-library/react";
import { MineProject } from "@/components/mine/Projects/MineProject";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";

const props = {
  mines: MOCK.MINES.mines,
  mineGuid: "18145c75-49ad-0101-85f3-a43e45ae989a",
  projects: MOCK.PROJECTS.records,
  projectSummaryStatusCodesHash: MOCK.PROJECT_SUMMARY_STATUS_CODES_HASH,
};
const dispatchProps = {
  fetchProjectsByMine: jest.fn(() => Promise.resolve()),
};

describe("MineProject", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <ReduxWrapper>
          <MineProject {...dispatchProps} {...props} />
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
