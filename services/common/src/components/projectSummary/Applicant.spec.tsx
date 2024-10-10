import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { PROJECTS, STATIC_CONTENT, AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import { FORM } from "../..";
import FormWrapper from "../forms/FormWrapper";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import Applicant from "./Applicant";

const initialState = {
  form: {
    [FORM.ADD_EDIT_PROJECT_SUMMARY]: {
      values: {},
    },
  },
  [PROJECTS]: {
    projectSummary: MOCK.PROJECT_SUMMARY,
  },
  [STATIC_CONTENT]: {
    provinceOptions: MOCK.BULK_STATIC_CONTENT_RESPONSE.provinceOptions,
  },
  [AUTHENTICATION]: {
    systemFlag: "ms",
  },
};

describe("Applicant Component", () => {
  it("should render the component with expected fields", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <FormWrapper
          name={FORM.ADD_EDIT_PROJECT_SUMMARY}
          initialValues={initialState}
          onSubmit={() => {}}
        >
          <Applicant />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
