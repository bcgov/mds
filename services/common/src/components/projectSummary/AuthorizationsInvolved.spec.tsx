import React from "react";
import { render } from "@testing-library/react";
import AuthorizationsInvolved from "./AuthorizationsInvolved";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { FORM } from "@mds/common/constants/forms";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { PROJECT } from "@mds/common/tests/mocks/dataMocks";
import { PROJECTS } from "@mds/common/constants/reducerTypes";

const initialState = {
  [PROJECTS]: {
    project: PROJECT,
  },
};

describe("AuthorizationsInvolved", () => {
  it("renders properly", () => {
    const component = render(
      <ReduxWrapper initialState={initialState}>
        <FormWrapper
          name={FORM.ADD_EDIT_PROJECT_SUMMARY}
          initialValues={PROJECT}
          onSubmit={() => {}}
        >
          <AuthorizationsInvolved />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
