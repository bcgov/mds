import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import DigitalCredentialDetails from "@/components/mine/DigitalPermitCredential/DigitalCredentialDetails";

const initialState = {
  [STATIC_CONTENT]: {
    mineCommodityOptions: MOCK.BULK_STATIC_CONTENT_RESPONSE.mineCommodityOptions,
    mineDisturbanceOptions: MOCK.BULK_STATIC_CONTENT_RESPONSE.mineDisturbanceOptions,
  },
};

jest.mock("@mds/common/components/explosivespermits/ExplosivesPermitMap", () => {
  return function DummyMap() {
    return <div data-testid="mockMapComponent"></div>;
  };
});

describe("ViewDigitalPermitCredential", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <DigitalCredentialDetails
          mine={MOCK.MINES.mines[MOCK.MINES.mineIds[0]]}
          permitRecord={MOCK.PERMITS[0] as any}
        />
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
