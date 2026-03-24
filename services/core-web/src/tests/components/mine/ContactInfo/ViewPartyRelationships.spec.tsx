import React from "react";
import { render } from "@testing-library/react";
import { ViewPartyRelationships } from "@/components/mine/ContactInfo/ViewPartyRelationships";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { PARTIES, PERMITS, MINES, AUTHENTICATION } from "@mds/common/constants/reducerTypes";

const mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];

const initialState = {
  [PARTIES]: { partyRelationships: MOCK.PARTYRELATIONSHIPS },
  [PERMITS]: { permits: MOCK.PERMITS },
  [MINES]: { ...MOCK.MINES, mineGuid: mine.mine_guid },
  [AUTHENTICATION]: { userAccessData: [], userInfo: {}, isAuthenticated: false },
};

describe("ViewPartyRelationships", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <ViewPartyRelationships mine={mine} />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
