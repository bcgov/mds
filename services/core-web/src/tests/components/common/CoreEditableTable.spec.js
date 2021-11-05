import React from "react";
import { shallow } from "enzyme";
import { CoreEditableTable } from "@/components/common/CoreEditableTable";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {};

const setupProps = () => {
  props.isViewMode = false;
  props.fieldName = "permit Number";
  props.tableContent = {};
  props.fieldID = "123";
  props.type = "Activity";
  props.unitTypeHash = {};
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("CoreEditableTable", () => {
  it("renders properly", () => {
    const wrapper = shallow(<CoreEditableTable {...props} {...dispatchProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
