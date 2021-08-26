import React from "react";
import { shallow } from "enzyme";
import { MergePartyConfirmationForm } from "@/components/Forms/parties/MergePartyConfirmationForm";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.isPerson = false;
  props.title = "Merge Contact";
  props.submitting = false;
  props.provinceOptions = MOCK.DROPDOWN_PROVINCE_OPTIONS;
  props.initialValues = {};
  props.party = MOCK.PARTY.parties[MOCK.PARTY.partyIds[0]];
  props.roles = [];
  props.partyRelationshipTypesHash = {};
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MergePartyConfirmationForm", () => {
  it("renders properly", () => {
    const component = shallow(<MergePartyConfirmationForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
