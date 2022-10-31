import React from "react";
import { shallow } from "enzyme";
import { EngineerOfRecord } from "@common/components/tailings/EngineerOfRecord";
import TailingsProvider from "@common/components/tailings/TailingsProvider";

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
    const component = shallow(
      <TailingsProvider>
        <EngineerOfRecord {...dispatchProps} {...props} />
      </TailingsProvider>
    );
    expect(component).toMatchSnapshot();
  });
});
