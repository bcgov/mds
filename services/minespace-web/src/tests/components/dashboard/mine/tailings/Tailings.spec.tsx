import React from "react";
import { render } from "@testing-library/react";
import { Tailings } from "@/components/dashboard/mine/tailings/Tailings";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { SidebarProvider } from "@mds/common/components/common/SidebarWrapper";
import { AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import { USER_ROLES } from "@mds/common/constants/environment";
import { SystemFlagEnum } from "@mds/common/constants/enums";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: jest.fn(),
  }),
}));

const initialState = {
  [AUTHENTICATION]: {
    userAccessData: [USER_ROLES.role_minespace_proponent],
    systemFlag: SystemFlagEnum.ms,
  },
};

describe("Tailings", () => {
  it("renders properly", () => {
    const component = render(
      <ReduxWrapper initialState={initialState}>
        <SidebarProvider value={{ mine: MOCK.MINES.mines[MOCK.MINES.mineIds[0]] } as any}>
          <Tailings />
        </SidebarProvider>
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
