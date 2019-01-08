import React from "react";
import { shallow } from "enzyme";
import EditPartyRelationshipModal from "@/components/modalContent/EditPartyRelationshipModal";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.handleChange = jest.fn();
  dispatchProps.handlePartySubmit = jest.fn();
};

const setupProps = () => {
  props.partyRelationship = MOCK.PARTYRELATIONSHIP;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("EditPartyRelationshipModal", () => {
  it("renders properly", () => {
    const component = shallow(<EditPartyRelationshipModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
