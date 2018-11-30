import React from "react";
import { shallow } from "enzyme";
import MineRecordForm from "@/components/Forms/MineRecordForm";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
  props.mineStatusOptions = MOCK.STATUS_OPTIONS.options;
  props.mineRegionOptions = MOCK.REGION_OPTIONS.options;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MineRecordForm", () => {
  it("renders properly", () => {
    const component = shallow(<MineRecordForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
