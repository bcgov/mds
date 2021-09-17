import React from "react";
import { shallow } from "enzyme";
import { MergePartyConfirmationModal } from "@/components/modalContent/MergePartyConfirmationModal";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
  props.initialValues = {};
  props.provinceOptions = [];
  props.isPerson = false;
  props.partyRelationshipTypesHash = {};
  props.roles = [];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MergePartyConfirmationModal", () => {
  it("renders properly", () => {
    const component = shallow(<MergePartyConfirmationModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
