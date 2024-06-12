import React from "react";
import { render } from "@testing-library/react";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { FORM } from "@mds/common/constants/forms";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { PERMITS, PROJECTS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import DocumentUpload from "./DocumentUpload";

const initialState = {
  [PROJECTS]: {
    projectSummary: MOCK.PROJECT_SUMMARY,
  },
  [PERMITS]: {
    permits: MOCK.PERMITS,
  },
  [STATIC_CONTENT]: {
    projectSummaryDocumentTypes: MOCK.BULK_STATIC_CONTENT_RESPONSE.projectSummaryDocumentTypes,
  },
};

describe("DocumentUpload", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <FormWrapper
          name={FORM.ADD_EDIT_PROJECT_SUMMARY}
          initialValues={MOCK.PERMITS}
          onSubmit={() => {}}
        >
          <DocumentUpload />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
