import React from "react";
import { shallow } from "enzyme";
import { ProjectDescriptionTab } from "./ProjectDescriptionTab";
import FeatureFlagContext from "@mds/common/providers/featureFlags/featureFlag.context";

describe("ProjectDescriptionTab", () => {
  it("renders properly", () => {
    const component = shallow(
      <FeatureFlagContext.Provider
        value={{
          isFeatureEnabled: () => true,
        }}
      >
        <ProjectDescriptionTab />
      </FeatureFlagContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
