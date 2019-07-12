import React from "react";
import { shallow } from "enzyme";
import { MineRecordModal } from "@/components/modalContent/MineRecordModal";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
  props.mineStatusOptions = MOCK.STATUS_OPTIONS.records;
  props.mineRegionOptions = MOCK.REGION_DROPDOWN_OPTIONS;
  props.initialValues = {};
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MineRecordModal", () => {
  it("renders properly", () => {
    const component = shallow(<MineRecordModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
