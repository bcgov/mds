import React from "react";
import { shallow } from "enzyme";
import { DecisionPackageTab } from "@/components/mine/Projects/DecisionPackageTab";
import * as MOCK from "@/tests/mocks/dataMocks";
import FeatureFlagContext from "@common/providers/featureFlags/featureFlag.context";

const props = {};

const setupProps = () => {
  props.project = MOCK.PROJECT;
  props.match = { params: { projectGuid: "1234-4567-xwqy" } };
};

const setupDispatchProps = () => {
  props.fetchProjectById = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("DecisionPackageTab", () => {
  it("renders properly", () => {
    const component = shallow(
      <FeatureFlagContext.Provider
        value={{
          isFeatureEnabled: () => true,
        }}
      >
        <DecisionPackageTab {...props} />
      </FeatureFlagContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
