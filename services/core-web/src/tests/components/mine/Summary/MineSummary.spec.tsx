import React from "react";
import { render } from "@testing-library/react";
import { MineSummary } from "@/components/mine/Summary/MineSummary";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { IPermitPartyRelationship } from "@mds/common/interfaces";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";


function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({ id: "18145c75-49ad-0101-85f3-a43e45ae989a" }),
  };
}

jest.mock("react-router-dom", () => mockFunction());
jest.mock("@/components/mine/MineHeader", () => {
  return function DummyMineHeader() {
    return <div data-testid="mockMineHeader"></div>;
  };
})

describe("MineSummary", () => {
  it("renders properly", () => {
    const { container } = render(
      <BrowserRouter>
        <ReduxWrapper>
          <MineSummary
            // @ts-ignore
            mines={MOCK.MINES.mines}
            minePermits={MOCK.PERMITS}
            partyRelationshipTypes={MOCK.PARTY_RELATIONSHIP_TYPES}
            partyRelationships={MOCK.PARTYRELATIONSHIPS as any as IPermitPartyRelationship[]}
            mineComplianceInfo={MOCK.COMPLIANCE}
          />
        </ReduxWrapper>
      </BrowserRouter>);
    expect(container).toMatchSnapshot();
  });
});
