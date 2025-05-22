import React from "react";
import { render } from "@testing-library/react";
import { PartyProfile } from "@/components/parties/PartyProfile";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

// Test suite failed to run

//     Jest worker encountered 4 child process exceptions, exceeding retry limit
describe("PartyProfile", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <ReduxWrapper>
          <PartyProfile
            fetchPartyById={jest.fn(() => Promise.resolve({}))}
            fetchPartyRelationships={jest.fn(() => Promise.resolve({}))}
            fetchPartyRelationshipTypes={jest.fn(() => Promise.resolve({}))}
            fetchProvinceCodes={jest.fn()}
            fetchMineBasicInfoList={jest.fn(() => Promise.resolve({}))}
            openModal={jest.fn()}
            closeModal={jest.fn()}
            updateParty={jest.fn()}
            parties={MOCK.PARTY.partiesWithAppointments}
            partyRelationships={MOCK.PARTYRELATIONSHIPS}
            partyRelationshipTypeHash={MOCK.PARTY_RELATIONSHIP_TYPE_HASH}
            mineBasicInfoListHash={MOCK.MINE_INFO_HASH}
            provinceOptions={MOCK.DROPDOWN_PROVINCE_OPTIONS}
            match={{ params: { id: MOCK.PARTY.partyIds[0] }, isExact: true, path: "", url: "" }}
          />
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
