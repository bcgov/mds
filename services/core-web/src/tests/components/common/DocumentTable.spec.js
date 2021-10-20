import React from "react";
import { shallow } from "enzyme";
import { DocumentTable } from "@/components/common/DocumentTable";

let props = {};
let dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.removeDocument = jest.fn();
};

const setupProps = () => {
  props.documents = [];
  props.isViewOnly = true;
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("DocumentTable", () => {
  it("renders properly", () => {
    const wrapper = shallow(<DocumentTable {...props} {...dispatchProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
