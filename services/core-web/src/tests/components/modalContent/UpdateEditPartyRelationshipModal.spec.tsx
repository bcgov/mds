import React from "react";
import { render } from "@testing-library/react";
import EditPartyRelationshipModal from "@/components/modalContent/EditPartyRelationshipModal";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  onSubmit: jest.fn(),
  handleChange: jest.fn(),
  handlePartySubmit: jest.fn(),
};
const props = {
  partyRelationship: MOCK.PARTYRELATIONSHIPS[0],
  partyRelationshipType: { description: "Permittee" },
};

describe("EditPartyRelationshipModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><EditPartyRelationshipModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
