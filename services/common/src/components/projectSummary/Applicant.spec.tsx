import React from "react";
import { render, screen } from "@testing-library/react";
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

const renderApplicant = (values = initialValues) =>
  render(
    <ReduxWrapper initialState={initialState}>
      <FormWrapper
        name={FORM.ADD_EDIT_PROJECT_SUMMARY}
        initialValues={values}
        onSubmit={() => {}}
      >
        <Applicant fieldsDisabled={false} />
      </FormWrapper>
    </ReduxWrapper>
  );

describe("Applicant Component", () => {
  it("should render the component with expected fields", () => {
    const { container } = renderApplicant();
    expect(container).toMatchSnapshot();
  });

  it("should show the company callout when the applicant type is a company", () => {
    renderApplicant({ applicant: { party_type_code: "ORG" } });
    expect(screen.getByText(/Enter the company or organization/)).toBeInTheDocument();
    expect(screen.queryByText(/Enter the individual/)).not.toBeInTheDocument();
  });

  it("should show the person callout when the applicant type is a person", () => {
    renderApplicant({ applicant: { party_type_code: "PER" } });
    expect(screen.getByText(/Enter the individual who will hold/)).toBeInTheDocument();
    expect(screen.queryByText(/Enter the company or organization/)).not.toBeInTheDocument();
  });
});
