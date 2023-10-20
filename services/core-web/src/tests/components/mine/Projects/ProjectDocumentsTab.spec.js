import React from "react";
import { shallow } from "enzyme";
import { ProjectDocumentsTab } from "@/components/mine/Projects/ProjectDocumentsTab";
import * as MOCK from "@/tests/mocks/dataMocks";
import FeatureFlagContext from "@mds/common/providers/featureFlags/featureFlag.context";

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

describe("ProjectDocumentsTab", () => {
  it("renders properly", () => {
    const component = shallow(
      <FeatureFlagContext.Provider
        value={{
          isFeatureEnabled: () => true,
        }}
      >
        <ProjectDocumentsTab {...props} />
      </FeatureFlagContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
