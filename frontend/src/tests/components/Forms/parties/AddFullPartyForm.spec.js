import React from "react";
import { shallow } from "enzyme";
import { AddFullPartyForm } from "@/components/Forms/parties/AddFullPartyForm";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.togglePartyChange = jest.fn();
};

const setupProps = () => {
  props.isPerson = false;
  props.provinceOptions = MOCK.DROPDOWN_PROVINCE_OPTIONS;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddFullPartyForm", () => {
  it("renders properly", () => {
    const component = shallow(<AddFullPartyForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
