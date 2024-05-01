import React from "react";
import { Projects } from "@/components/dashboard/mine/projects/Projects";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { PROJECTS } from "@mds/common/constants/reducerTypes";
import { SidebarProvider } from "@mds/common/components/common/SidebarWrapper";
import { BrowserRouter } from "react-router-dom";

const initialState = {
  [PROJECTS]: { projects: MOCK.PROJECTS.records },
};

const mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];

describe("Projects", () => {
  it("renders properly", () => {
    const { container } = render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <SidebarProvider value={{ mine } as any}>
            <Projects />
          </SidebarProvider>
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(container).toMatchSnapshot();
  });
});
