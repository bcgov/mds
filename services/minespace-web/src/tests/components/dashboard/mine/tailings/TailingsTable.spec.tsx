import { BrowserRouter } from "react-router-dom";
import React from "react";
import { render } from "@testing-library/react";
import { TailingsTable } from "@/components/dashboard/mine/tailings/TailingsTable";
import { STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { BULK_STATIC_CONTENT_RESPONSE, TSF } from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const initialState = {
  [STATIC_CONTENT]: BULK_STATIC_CONTENT_RESPONSE,
};

describe("TailingsTable", () => {
  it("renders properly", () => {
    const { container } = render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <TailingsTable
            tailings={[TSF]}
            openEditTailingsModal={jest.fn()}
            handleEditTailings={jest.fn()}
            editTailings={jest.fn()}
            canEditTSF
          />
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(container).toMatchSnapshot();
  });
});
