import React from "react";
import { shallow } from "enzyme";
import { Project } from "@/components/mine/Projects/Project";
import * as MOCK from "@/tests/mocks/dataMocks";
import FeatureFlagContext from "@mds/common/providers/featureFlags/featureFlag.context";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.match = {
    params: {
      projectGuid: "18145c75-49ad-0101-85f3-a43e45ae989a",
    },
  };
  props.project = MOCK.PROJECT;
};

const setupDispatchProps = () => {
  dispatchProps.fetchProjectById = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("Project", () => {
  it("renders properly", () => {
    const component = shallow(
      <FeatureFlagContext.Provider
        value={{
          isFeatureEnabled: () => true,
        }}
      >
        <Project {...dispatchProps} {...props} />
      </FeatureFlagContext.Provider>
    );

    expect(component).toMatchSnapshot();
  });
});
