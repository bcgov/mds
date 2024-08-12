import React from "react";
import ReplaceDocumentModal from "@mds/common/components/documents/ReplaceDocumentModal";

import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { MINEDOCUMENTS } from "@mds/common/tests/mocks/dataMocks";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { FORM } from "@mds/common/constants/forms";

const props: any = {
  document: MINEDOCUMENTS.records[0],
  handleSubmit: jest.fn().mockReturnValue(Promise.resolve()),
  closeModal: jest.fn(),
  postNewDocumentVersion: jest.fn().mockReturnValue(Promise.resolve()),
  alertMessage: "This is a test alert message.",
};

describe("ReplaceDocumentModal", () => {
  it("renders correctly and matches the snapshot", () => {
    const { container } = render(
      <ReduxWrapper initialState={{}}>
        <FormWrapper name={FORM.ADD_EDIT_PROJECT_SUMMARY} initialValues={{}} onSubmit={() => {}}>
          <ReplaceDocumentModal {...props} />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
