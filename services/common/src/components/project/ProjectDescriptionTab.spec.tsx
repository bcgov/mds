import React from "react";
import { render } from "@testing-library/react";
import ProjectDescriptionTab from "./ProjectDescriptionTab";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { PROJECTS, PERMITS } from "@mds/common/constants/reducerTypes";

const initialState = {
  [PROJECTS]: {
    project: MOCK.PROJECT,
  },
  [PERMITS]: { permits: MOCK.PERMITS },
};

describe("ProjectDescriptionTab", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <ProjectDescriptionTab />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
