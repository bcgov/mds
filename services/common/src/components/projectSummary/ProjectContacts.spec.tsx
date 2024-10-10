import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { PROJECTS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { FORM } from "../..";
import FormWrapper from "../forms/FormWrapper";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import ProjectContacts from "./ProjectContacts";

const initialState = {
  [PROJECTS]: {
    projectSummary: MOCK.PROJECT_SUMMARY,
  },
  [STATIC_CONTENT]: {
    provinceOptions: MOCK.BULK_STATIC_CONTENT_RESPONSE.provinceOptions,
  },
};

describe("ProjectContacts Component", () => {
  it("should render the component with expected fields", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <FormWrapper name={FORM.ADD_EDIT_PROJECT_SUMMARY} initialValues={{}} onSubmit={() => {}}>
          <ProjectContacts />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
