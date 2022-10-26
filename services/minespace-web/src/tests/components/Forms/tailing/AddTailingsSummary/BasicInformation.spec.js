import React from "react";
import { shallow } from "enzyme";
import { BasicInformation } from "@common/components/tailings/BasicInformation";
import { renderConfig } from "@/components/common/config";

const dispatchProps = {};
const props = {
  permits: [{}],
  renderConfig,
};

const setupDispatchProps = () => {};

const setupProps = () => {};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("BasicInformation", () => {
  it("renders properly", () => {
    const component = shallow(<BasicInformation {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
