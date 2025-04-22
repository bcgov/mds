import React from "react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { NOTICE_OF_WORK, PROJECTS } from "@mds/common/constants/reducerTypes";
import { SidebarProvider } from "@mds/common/components/common/SidebarWrapper";
import { BrowserRouter } from "react-router-dom";
import ViewProjects from "@/components/dashboard/mine/projects/ViewProjects";

const initialState = {
  [PROJECTS]: { projects: MOCK.PROJECTS.records },
  [NOTICE_OF_WORK]: { noticeOfWorkList: MOCK.NOW.applications },
};

const mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];

describe("ViewProjects", () => {
  it("renders major mines application tab properly", () => {
    const { container } = render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <SidebarProvider value={{ mine, subTab: "major-mine" } as any}>
            <ViewProjects />
          </SidebarProvider>
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(container).toMatchSnapshot();
  });

  it("renders now application tab properly", () => {
    const { container } = render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <SidebarProvider value={{ mine, subTab: "notice-of-work" } as any}>
            <ViewProjects />
          </SidebarProvider>
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(container).toMatchSnapshot();
  });
});
