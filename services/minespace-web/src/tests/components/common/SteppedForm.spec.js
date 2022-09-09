import React from "react";
import { shallow } from "enzyme";
import SteppedForm from "@/components/common/SteppedForm";

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
      <SteppedForm {...dispatchProps} {...props}>
        <div />
        <div />
      </SteppedForm>
    );
    expect(component).toMatchSnapshot();
  });
});
