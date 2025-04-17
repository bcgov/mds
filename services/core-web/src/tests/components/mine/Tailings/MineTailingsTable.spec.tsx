import React from "react";
import MineTailingsTable from "@/components/mine/Tailings/MineTailingsTable";
import { STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { BULK_STATIC_CONTENT_RESPONSE, TSF } from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { render } from "@testing-library/react";

const initialState = {
  [STATIC_CONTENT]: BULK_STATIC_CONTENT_RESPONSE,
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      mineGuid: "18133c75-49ad-4101-85f3-a43e35ae989a",
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());

describe("MineTailingsTable", () => {
  it("renders properly", () => {
    const component = render(
      <ReduxWrapper initialState={initialState}>
        <MineTailingsTable
          tailings={[TSF]}
          isLoaded={true}
          openEditTailingsModal={jest.fn()}
          handleEditTailings={jest.fn()}
          tsfV2Enabled={true}
          canEditTSF={true}
        />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
