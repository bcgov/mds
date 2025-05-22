import React from "react";
import { render } from "@testing-library/react";
import EditPartyRelationshipModal from "@/components/modalContent/EditPartyRelationshipModal";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.handleChange = jest.fn();
  dispatchProps.handlePartySubmit = jest.fn();
};

const setupProps = () => {
  props.partyRelationship = MOCK.PARTYRELATIONSHIPS[0];
  props.partyRelationshipType = { description: "Permittee" }
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("EditPartyRelationshipModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><EditPartyRelationshipModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
