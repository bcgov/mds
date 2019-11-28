import React from "react";
import { shallow } from "enzyme";
import { AddPartyModal } from "@/components/modalContent/AddPartyModal";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.submit = jest.fn();
  dispatchProps.fetchData = jest.fn();
  dispatchProps.fetchMineNameList = jest.fn();
  dispatchProps.createParty = jest.fn();
  dispatchProps.reset = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
  props.addPartyFormValues = {};
  props.addPartyForm = {};
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddPartyModal", () => {
  it("renders properly", () => {
    const component = shallow(<AddPartyModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
