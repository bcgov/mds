import React from "react";
import { shallow } from "enzyme";
import SteppedForm from "@common/components/SteppedForm";
import Step from "@common/components/Step";

const dispatchProps = {};
const props = {
  tabs: ["basic-information"],
  form: <div />,
  handleTabChange: jest.fn(),
  handleSaveDraft: jest.fn(),
  match: {
    params: {
      tab: "basic-information",
    },
  },
  errors: ["error"],
};

const setupDispatchProps = () => {};

const setupProps = () => {};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("SteppedForm", () => {
  it("renders properly", () => {
    const component = shallow(
      <SteppedForm {...dispatchProps} {...props} activeTab="1">
        <Step key="1">
          <div />
        </Step>
        <Step key="2">
          <div />
        </Step>
      </SteppedForm>
    );
    expect(component).toMatchSnapshot();
  });
});
