import React from "react";
import { shallow } from "enzyme";
import { ViewConditionModal } from "@/components/modalContent/ViewConditionModal";
import * as Mock from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.conditions = [];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("ViewConditionModal", () => {
  it("renders properly", () => {
    const component = shallow(<ViewConditionModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
