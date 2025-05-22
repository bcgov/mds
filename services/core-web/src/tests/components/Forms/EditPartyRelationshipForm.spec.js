import React from "react";
import { render } from "@testing-library/react";
import { EditPartyRelationshipForm } from "@/components/Forms/PartyRelationships/EditPartyRelationshipForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { PARTYRELATIONSHIPS, TSF } from "@mds/common/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
};

const setupProps = () => {
  props.partyRelationship = { mine_party_appt_type_code: "EOR" };
  props.partyRelationshipType = { mine_party_appt_type_code: "EOR" };
  props.partyRelationships = PARTYRELATIONSHIPS;
  props.submitting = false;
  props.mine = { mine_tailings_storage_facilities: [TSF] };
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("EditPartyRelationshipForm", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><EditPartyRelationshipForm {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
