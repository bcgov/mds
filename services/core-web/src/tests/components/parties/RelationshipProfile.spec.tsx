import React from "react";
import { render } from "@testing-library/react";
import { RelationshipProfile } from "@/components/parties/RelationshipProfile";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { MINES, PARTIES, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";

const initialState = {
  [PARTIES]: {
    parties: MOCK.PARTY.parties[MOCK.PARTY.partyIds[0]],
    partyRelationships: MOCK.PARTYRELATIONSHIPS,
  },
  [MINES]: { ...MOCK.MINES, mineGuid: "18133c75-49ad-4101-85f3-a43e35ae989a" },
  [STATIC_CONTENT]: {
    partyRelationshipTypes: MOCK.BULK_STATIC_CONTENT_RESPONSE.partyRelationshipTypes,
  },
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");

  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      id: "18133c75-49ad-4101-85f3-a43e35ae989a",
      typeCode: "MMG",
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());

describe("RelationshipProfile", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <RelationshipProfile />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
