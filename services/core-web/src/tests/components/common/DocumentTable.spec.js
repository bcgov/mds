import React from "react";
import { shallow } from "enzyme";
import { DocumentTable } from "@/components/common/DocumentTable";
import FeatureFlagContext from "@common/providers/featureFlags/featureFlag.context";

let props = {};
let dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.removeDocument = jest.fn();
};

const setupProps = () => {
  props.documents = [];
  props.isViewOnly = true;
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("DocumentTable", () => {
  it("renders properly", () => {
    const component = shallow(
      <FeatureFlagContext.Provider
        value={{
          isFeatureEnabled: () => true,
        }}
      >
        <DocumentTable {...props} {...dispatchProps} />
      </FeatureFlagContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
