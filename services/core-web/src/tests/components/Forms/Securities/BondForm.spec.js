import React from "react";
import { shallow } from "enzyme";
import { BondForm } from "@/components/Forms/Securities/BondForm";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.title = "Add Bond";
  props.permitGuid = "462562457";
  props.submitting = false;
  props.provinceOptions = MOCK.DROPDOWN_PROVINCE_OPTIONS;
  props.bondTypeOptions = [];
  props.bondStatusOptionsHash = MOCK.BULK_STATIC_CONTENT_RESPONSE.bondStatusOptions;
  [props.bond] = MOCK.BONDS.records;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("BondForm", () => {
  it("renders properly", () => {
    const component = shallow(<BondForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
