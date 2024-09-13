import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { PROJECTS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { FORM } from "../..";
import FormWrapper from "../forms/FormWrapper";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import AuthorizationSupportDocumentUpload from "./AuthorizationSupportDocumentUpload";

const initialState = {
  [PROJECTS]: {
    projectSummary: MOCK.PROJECT_SUMMARY,
  },
  [STATIC_CONTENT]: {
    provinceOptions: MOCK.BULK_STATIC_CONTENT_RESPONSE.provinceOptions,
  },
};

describe("AuthorizationSupportDocumentUpload Component", () => {
  it("should render the component with expected fields", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <FormWrapper name={FORM.ADD_EDIT_PROJECT_SUMMARY} initialValues={{}} onSubmit={() => {}}>
          <AuthorizationSupportDocumentUpload
            code={"code"}
            mineGuid={"mine_guid"}
            documents={[]}
            updateAmendmentDocument={() => {}}
            removeAmendmentDocument={() => {}}
            projectGuid={"project_guid"}
            projectSummaryGuid={"project_summary_guid"}
            showExemptionSection={false}
            isAmendment={false}
            amendmentChanges={[]}
            isDisabled={false}
          />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
