import React from "react";
import { shallow } from "enzyme";
import { VarianceFileUpload } from "@/components/Forms/variances/VarianceFileUpload";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onFileLoad = jest.fn();
  dispatchProps.onRemoveFile = jest.fn();
};

const setupProps = () => {
  props.mineGuid = "48593";
  props.mineNo = "B01034";
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("VarianceFileUpload", () => {
  it("renders properly", () => {
    const component = shallow(<VarianceFileUpload {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
