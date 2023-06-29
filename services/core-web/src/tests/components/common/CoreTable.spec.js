import React from "react";
import { shallow } from "enzyme";
import CoreTable from "@/components/common/CoreTable";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {};

const setupProps = () => {
  props.columns = [];
  props.dataSource = {};
  props.condition = true;
  props.tableProps = {};
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("CoreTable", () => {
  it("renders properly", () => {
    const wrapper = shallow(<CoreTable {...props} {...dispatchProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
