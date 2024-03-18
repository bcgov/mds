import React from "react";
import { render } from "@testing-library/react";
import { AuthorizationsInvolved } from "@/components/Forms/projects/projectSummary/AuthorizationsInvolved";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { FORM } from "@mds/common";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const props: any = {};

const setupProps = () => {
  props.formattedProjectSummary = {};
  props.dropdownProjectSummaryPermitTypes = [];
  props.transformedProjectSummaryAuthorizationTypes = [];
};

beforeEach(() => {
  setupProps();
});

describe("AuthorizationsInvolved", () => {
  it("renders properly", () => {
    const component = render(
      <ReduxWrapper initialState={{}}>
        <FormWrapper name={FORM.ADD_EDIT_PROJECT_SUMMARY} onSubmit={() => {}}>
          <AuthorizationsInvolved {...props} />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
