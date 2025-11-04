import React from "react";
import { render } from "@testing-library/react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";  // Move this import up
import { MineSummary } from "@/components/mine/Summary/MineSummary";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import {
  COMPLIANCE,
  MINES,
  PARTIES,
  PERMITS,
  STATIC_CONTENT,
} from "@mds/common/constants/reducerTypes";

const mine = MOCK.MINES.mines[MOCK.MINES.mineIds[1]];

const initialState = {
  [MINES]: {
    ...MOCK.MINES,
    mineGuid: mine.mine_guid,
    mines: {
      [mine.mine_guid]: mine
    }
  },
  [PARTIES]: { partyRelationships: MOCK.PARTYRELATIONSHIPS },
  [PERMITS]: { permits: MOCK.PERMITS },
  [COMPLIANCE]: { complianceInfo: MOCK.COMPLIANCE },
  [STATIC_CONTENT]: {
    partyRelationshipTypes: MOCK.BULK_STATIC_CONTENT_RESPONSE.partyRelationshipTypes,
    ...MOCK.BULK_STATIC_CONTENT_RESPONSE,
  },
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({ id: MOCK.MINES.mineIds[1] }),
  };
}

jest.mock("react-router-dom", () => mockFunction());
jest.mock("@/components/mine/MineHeader", () => {
  return function DummyMineHeader() {
    return <div data-testid="mockMineHeader"></div>;
  };
});

describe("MineSummary", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <MineSummary />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
