import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { MINES, PERMITS } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import DigitalPermitCredential from "@/components/mine/DigitalPermitCredential/DigitalPermitCredential";

const initialState = {
  [MINES]: MOCK.MINES,
  [PERMITS]: { permits: MOCK.PERMITS },
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

describe("DigitalPermitCredential", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <DigitalPermitCredential />
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
