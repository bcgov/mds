import React from "react";
import { shallow } from "enzyme";
import { AddContactModal } from "@/components/modalContent/contacts/AddContactModal";

const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.onCancel = jest.fn();
  dispatchProps.onSubmit = jest.fn();
};

beforeEach(() => {
  setupDispatchProps();
});

describe("AddContactModal", () => {
  it("renders properly", () => {
    const component = shallow(<AddContactModal {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
