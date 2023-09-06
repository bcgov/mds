import React from "react";
import { shallow } from "enzyme";
import { DocumentsTab } from "@/components/pages/Project/DocumentsTab";
import * as MOCK from "@/tests/mocks/dataMocks";
import FeatureFlagContext from "@common/providers/featureFlags/featureFlag.context";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.match = { params: { projectGuid: "dca276c0-acb8-4b13-a9d4-3781c0aa13f0" } };
  props.history = { push: jest.fn() };
  props.project = MOCK.PROJECT;
};

const setupDispatchProps = () => {
  dispatchProps.fetchProjectById = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("DocumentsTab", () => {
  it("renders properly", () => {
    const component = shallow(
      <FeatureFlagContext.Provider
        value={{
          isFeatureEnabled: () => true,
        }}
      >
        <DocumentsTab {...props} {...dispatchProps} />
      </FeatureFlagContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
