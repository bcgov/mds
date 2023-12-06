import React from "react";
import { shallow } from "enzyme";
import { BasicInformation } from "@/components/Forms/projects/projectSummary/BasicInformation";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {};

const setupProps = () => {};

jest.mock("@mds/common/providers/featureFlags/useFeatureFlag", () => ({
  useFeatureFlag: () => ({
    isFeatureEnabled: () => true,
  }),
}));

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
