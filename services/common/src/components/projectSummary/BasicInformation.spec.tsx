import React from "react";
import { render } from "@testing-library/react";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { FORM } from "@mds/common";
import { PROJECTS } from "@mds/common/constants/reducerTypes";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { PROJECT } from "@mds/common/tests/mocks/dataMocks";
import BasicInformation from "./BasicInformation";

window.scrollTo = jest.fn();

const initialState = {
  [PROJECTS]: {
    project: PROJECT,
  },
};

describe("BasicInformation", () => {
  test("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <FormWrapper name={FORM.ADD_EDIT_PROJECT_SUMMARY} onSubmit={() => {}}>
          <BasicInformation />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
