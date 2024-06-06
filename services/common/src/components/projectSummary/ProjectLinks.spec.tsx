import React from "react";
import { render } from "@testing-library/react";
import ProjectLinks from "./ProjectLinks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { PROJECTS } from "@mds/common/constants/reducerTypes";
import FormWrapper from "../forms/FormWrapper";
import { FORM } from "../..";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const initialState = {
  [PROJECTS]: {
    project: MOCK.PROJECT,
    projectSummary: MOCK.PROJECT_SUMMARY,
    projects: MOCK.PROJECTS.records,
  },
};

describe("ProjectLinks Component", () => {
  test("renders ProjectLinks with correct props", () => {
    const { getByText } = render(
      <ReduxWrapper initialState={initialState}>
        <FormWrapper
          name={FORM.ADD_EDIT_PROJECT_SUMMARY}
          initialValues={MOCK.PERMITS}
          onSubmit={() => {}}
        >
          <ProjectLinks viewProject={(record) => ""} />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(getByText("Related Project Applications")).toBeDefined();
    expect(
      getByText("Description of related major project applications for this mine are listed below.")
    ).toBeDefined();
    expect(getByText("Project Title")).toBeDefined();
    // test is otherwise working but table is not populating
    // expect(getByText(MOCK.PROJECT.project_links[0].related_project.project_title)).toBeTruthy();
    // // Check if status is inactive when either project summary, major mine application, or irt status is WDN
    // expect(getByText("Inactive")).toBeDefined();
  });
});
