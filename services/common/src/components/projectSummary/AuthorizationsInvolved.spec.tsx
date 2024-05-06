import React from "react";
import { render } from "@testing-library/react";
import AuthorizationsInvolved from "./AuthorizationsInvolved";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { FORM } from "@mds/common/constants/forms";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { PERMITS, PROJECTS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";

const initialState = {
  [PROJECTS]: {
    projectSummary: MOCK.PROJECT_SUMMARY,
  },
  [PERMITS]: {
    permits: MOCK.PERMITS,
  },
  [STATIC_CONTENT]: {
    projectSummaryPermitTypes: MOCK.BULK_STATIC_CONTENT_RESPONSE.projectSummaryPermitTypes,
    projectSummaryAuthorizationTypes:
      MOCK.BULK_STATIC_CONTENT_RESPONSE.projectSummaryAuthorizationTypes,
  },
};

describe("AuthorizationsInvolved", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <FormWrapper
          name={FORM.ADD_EDIT_PROJECT_SUMMARY}
          initialValues={MOCK.PROJECT_SUMMARY}
          onSubmit={() => {}}
        >
          <AuthorizationsInvolved {...MOCK.AUTHORIZATION_INVOLVED} />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
