import React from "react";
import { shallow } from "enzyme";
import { EditPartyModal } from "@/components/modalContent/EditPartyModal";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.oSubmit = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("EditPartyModal", () => {
  it("renders properly", () => {
    const component = shallow(<EditPartyModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
