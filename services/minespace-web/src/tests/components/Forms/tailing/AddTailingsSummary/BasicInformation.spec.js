import React from "react";
import { shallow } from "enzyme";
import { BasicInformation } from "@/components/Forms/tailing/tailingsStorageFacility/BasicInformation";

const dispatchProps = {};
const props = {};

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
