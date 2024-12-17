import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { PROJECTS, STATIC_CONTENT, AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import { FORM } from "@mds/common/constants/forms";
import FormWrapper from "../forms/FormWrapper";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import Applicant from "./Applicant";

const initialValues = {};
const initialState = {
  form: {
    [FORM.ADD_EDIT_PROJECT_SUMMARY]: {
      values: initialValues,
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
          initialValues={initialValues}
          onSubmit={() => { }}
        >
          <Applicant fieldsDisabled={false} />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
