import React from "react";
import { shallow } from "enzyme";
import { EditFullPartyForm } from "@/components/Forms/parties/EditFullPartyForm";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.isPerson = false;
  props.provinceOptions = MOCK.DROPDOWN_PROVINCE_OPTIONS;
  props.initialValues = {};
  props.party = MOCK.PARTY.parties[MOCK.PARTY.partyIds[0]];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("EditFullPartyForm", () => {
  it("renders properly", () => {
    const component = shallow(<EditFullPartyForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
