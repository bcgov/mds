import React from "react";
import { shallow } from "enzyme";
import { EngineerOfRecord } from "@/components/Forms/tailing/tailingsStorageFacility/EngineerOfRecord";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {};

const setupProps = () => {};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("EngineerOfRecord", () => {
  it("renders properly", () => {
    const component = shallow(<EngineerOfRecord {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
