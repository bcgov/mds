import React from "react";
import { render } from "@testing-library/react";
import { EditPartyRelationshipForm } from "@/components/Forms/PartyRelationships/EditPartyRelationshipForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { PARTYRELATIONSHIPS, TSF } from "@mds/common/tests/mocks/dataMocks";

const dispatchProps = {
  onSubmit: jest.fn(),
};
const props = {
  partyRelationship: { mine_party_appt_type_code: "EOR" },
  partyRelationshipType: { mine_party_appt_type_code: "EOR" },
  partyRelationships: PARTYRELATIONSHIPS,
  submitting: false,
  mine: { mine_tailings_storage_facilities: [TSF] },
};

describe("EditPartyRelationshipForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <EditPartyRelationshipForm {...dispatchProps} {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
