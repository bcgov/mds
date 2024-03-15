import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { MINES, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import ViewDigitalPermitCredential from "@/components/mine/DigitalPermitCredential/ViewDigitalPermitCredential";

const initialState = {
  [MINES]: MOCK.MINES,
  [STATIC_CONTENT]: {
    mineCommodityOptions: MOCK.BULK_STATIC_CONTENT_RESPONSE.mineCommodityOptions,
    mineDisturbanceOptions: MOCK.BULK_STATIC_CONTENT_RESPONSE.mineDisturbanceOptions,
  },
  verifiableCredentialConnections: {
    verifiableCredentialConnections: MOCK.MINES_ACT_PERMITS_VC_LIST,
  },
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      permitGuid: "1234",
      id: MOCK.MINES.mineIds[0],
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());
jest.mock("@mds/common/components/explosivespermits/ExplosivesPermitMap", () => {
  return function DummyMap() {
    return <div data-testid="mockMapComponent"></div>;
  };
});

describe("ViewDigitalPermitCredential", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <ViewDigitalPermitCredential />
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
