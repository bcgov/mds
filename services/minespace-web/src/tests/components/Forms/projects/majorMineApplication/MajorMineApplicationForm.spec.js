import React from "react";
import { shallow } from "enzyme";
import { MajorMineApplicationForm } from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationForm";
import * as MOCK from "@/tests/mocks/dataMocks";
import FeatureFlagContext from "@mds/common/providers/featureFlags/featureFlag.context";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.change = jest.fn(() => Promise.resolve());
};

const setupProps = () => {
  props.project = MOCK.PROJECT;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MajorMineApplicationForm", () => {
  it("renders properly", () => {
    const component = shallow(
      <FeatureFlagContext.Provider
        value={{
          isFeatureEnabled: () => true,
        }}
      >
        <MajorMineApplicationForm {...dispatchProps} {...props} />
      </FeatureFlagContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
