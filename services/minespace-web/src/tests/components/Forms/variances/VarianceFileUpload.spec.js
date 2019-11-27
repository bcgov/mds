import React from "react";
import { shallow } from "enzyme";
import { VarianceFileUpload } from "@/components/Forms/variances/VarianceFileUpload";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.mineGuid = "1738472";
};

const setupDispatchProps = () => {
  dispatchProps.onRemoveFile = jest.fn();
  dispatchProps.onFileLoad = jest.fn();
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("VarianceFileUpload", () => {
  it("renders properly", () => {
    const component = shallow(<VarianceFileUpload {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
