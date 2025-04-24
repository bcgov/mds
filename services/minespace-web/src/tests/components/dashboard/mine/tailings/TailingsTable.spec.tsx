import { BrowserRouter } from "react-router-dom";
import React from "react";
import { render } from "@testing-library/react";
import { TailingsTable } from "@/components/dashboard/mine/tailings/TailingsTable";
import { STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { BULK_STATIC_CONTENT_RESPONSE, TSF } from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { SidebarProvider } from "@mds/common/components/common/SidebarWrapper";

const initialState = {
  [STATIC_CONTENT]: BULK_STATIC_CONTENT_RESPONSE,
};

describe("TailingsTable", () => {
  it("renders properly", () => {
    const mockMine = {
      mine_guid: "mock-guid",
    };

    const { container } = render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <SidebarProvider value={{ mine: mockMine }}>
            <TailingsTable
              isLoaded={true}
              tailings={[TSF]}
              openEditTailingsModal={jest.fn()}
              handleEditTailings={jest.fn()}
              editTailings={jest.fn()}
              canEditTSF
            />
          </SidebarProvider>
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(container).toMatchSnapshot();
  });
});
